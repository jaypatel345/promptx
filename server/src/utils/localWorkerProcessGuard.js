import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const LOCAL_WORKER_PATTERNS = [
  "server/src/worker.js",
  "src/worker.js",
  "server/src/index.js",
  "src/index.js",
];

const isLocalDevelopment = () => process.env.NODE_ENV !== "production";

const normalizeCommand = (command) => command.replaceAll("\\", "/");

const getProcessCwd = async (pid) => {
  try {
    const { stdout } = await execFileAsync("lsof", [
      "-a",
      "-p",
      String(pid),
      "-d",
      "cwd",
      "-Fn",
    ]);
    const cwdLine = stdout.split("\n").find((line) => line.startsWith("n"));

    return cwdLine ? normalizeCommand(cwdLine.slice(1)) : null;
  } catch {
    return null;
  }
};

const parseProcessLine = (line) => {
  const match = line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/);

  if (!match) {
    return null;
  }

  return {
    pid: Number(match[1]),
    ppid: Number(match[2]),
    command: normalizeCommand(match[3]),
  };
};

const isPromptXServerProcess = async (processInfo, serverRoot) => {
  if (
    !processInfo ||
    processInfo.pid === process.pid ||
    processInfo.pid === process.ppid
  ) {
    return false;
  }

  if (!processInfo.command.includes("node")) {
    return false;
  }

  const normalizedServerRoot = normalizeCommand(serverRoot);
  const commandHasServerRoot = processInfo.command.includes(normalizedServerRoot);
  const commandHasKnownEntry = LOCAL_WORKER_PATTERNS.some((pattern) =>
    processInfo.command.includes(pattern),
  );

  if (!commandHasKnownEntry) {
    return false;
  }

  if (commandHasServerRoot) {
    return true;
  }

  const processCwd = await getProcessCwd(processInfo.pid);

  return processCwd === normalizedServerRoot;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isProcessAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

export const cleanupStaleLocalWorkerProcesses = async ({
  logger = console.log,
} = {}) => {
  if (!isLocalDevelopment()) {
    return [];
  }

  if (process.env.PROMPTX_SKIP_STALE_WORKER_CLEANUP === "1") {
    logger(
      JSON.stringify({
        level: "warn",
        event: "local_worker_cleanup.skipped",
        service: "worker-process-guard",
        timestamp: new Date().toISOString(),
        pid: process.pid,
        reason: "PROMPTX_SKIP_STALE_WORKER_CLEANUP=1",
      }),
    );
    return [];
  }

  const serverRoot = path.resolve(process.cwd());
  const { stdout } = await execFileAsync("ps", ["-axo", "pid=,ppid=,command="]);
  const candidates = stdout
    .split("\n")
    .map(parseProcessLine)
    .filter(Boolean);
  const staleProcesses = [];

  for (const processInfo of candidates) {
    if (await isPromptXServerProcess(processInfo, serverRoot)) {
      staleProcesses.push(processInfo);
    }
  }

  for (const staleProcess of staleProcesses) {
    try {
      process.kill(staleProcess.pid, "SIGTERM");
      logger(
        JSON.stringify({
          level: "warn",
          event: "local_worker_cleanup.sigterm_sent",
          service: "worker-process-guard",
          timestamp: new Date().toISOString(),
          pid: process.pid,
          stalePid: staleProcess.pid,
          command: staleProcess.command,
        }),
      );
    } catch (error) {
      logger(
        JSON.stringify({
          level: "warn",
          event: "local_worker_cleanup.sigterm_failed",
          service: "worker-process-guard",
          timestamp: new Date().toISOString(),
          pid: process.pid,
          stalePid: staleProcess.pid,
          message: error?.message,
        }),
      );
    }
  }

  if (staleProcesses.length > 0) {
    await wait(750);

    for (const staleProcess of staleProcesses) {
      if (!isProcessAlive(staleProcess.pid)) {
        continue;
      }

      try {
        process.kill(staleProcess.pid, "SIGKILL");
        logger(
          JSON.stringify({
            level: "warn",
            event: "local_worker_cleanup.sigkill_sent",
            service: "worker-process-guard",
            timestamp: new Date().toISOString(),
            pid: process.pid,
            stalePid: staleProcess.pid,
            command: staleProcess.command,
          }),
        );
      } catch (error) {
        logger(
          JSON.stringify({
            level: "warn",
            event: "local_worker_cleanup.sigkill_failed",
            service: "worker-process-guard",
            timestamp: new Date().toISOString(),
            pid: process.pid,
            stalePid: staleProcess.pid,
            message: error?.message,
          }),
        );
      }
    }
  }

  return staleProcesses;
};
