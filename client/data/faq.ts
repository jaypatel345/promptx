export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is PromptX and how does it differ from ChatGPT?",
    answer:
      "PromptX is a prompt generator and prompt template tool—not a chatbot or general knowledge assistant. You do not ask PromptX questions. Instead, you describe a task you want an AI to perform, and PromptX converts your rough instruction into a comprehensive, highly-structured prompt with roles, context, rules, and output formatting ready to paste into ChatGPT, Claude, Gemini, or Midjourney.",
  },
  {
    question: "How do I use PromptX alongside my existing AI tools?",
    answer:
      "The recommended workflow is keeping PromptX open on one side of your screen and your LLM (like ChatGPT or Claude) on the other. Type your rough idea into PromptX once, click 'Copy prompt', and paste the finished prompt into your LLM. You get production-grade output on your first turn instead of spending 10 iterations fixing hallucinations.",
  },
  {
    question: "Does PromptX work for image and video AI tools?",
    answer:
      "Yes. PromptX includes specialized prompt builders and over 20 tested prompt templates specifically engineered for image and video models like Midjourney, DALL·E 3, Stable Diffusion, Runway, and Pika. These templates automatically structure camera lenses, lighting ratios, aspect ratio flags, and color grading parameters.",
  },
  {
    question: "Do I need to sign up or enter a credit card to use PromptX?",
    answer:
      "No. PromptX is completely free to start for guest users. You can immediately generate and optimize prompts, browse our public template library, and copy prompts with zero friction. We offer optional accounts to sync your prompt library and Pro upgrades for unlimited high-volume generations.",
  },
  {
    question: "What should I enter into PromptX for best results?",
    answer:
      "Always describe a task, never a question. For example, instead of typing 'What is Kubernetes?', type 'Explain Kubernetes architecture to a junior backend developer with a microservices diagram and common failure modes'. PromptX takes your task description and injects professional prompt engineering architecture.",
  },
  {
    question: "Are my prompts and project ideas kept private?",
    answer:
      "Yes. Your prompts are strictly yours. Guest sessions stay in your local browser storage. We do not sell your prompt text or use your private inputs to train third-party machine learning models.",
  },
];

export const PE_FAQS: FaqItem[] = [
  {
    question: "What is the fastest way to get better answers from ChatGPT or Claude?",
    answer:
      "Assign the model an explicit expert role, define clear output constraints (such as word count or format), and explain the goal/audience before asking your question. Vague queries produce average answers because models assume generic context when none is provided.",
  },
  {
    question: "Does prompt engineering matter with smarter models like Claude 3.5 Sonnet or GPT-4o?",
    answer:
      "Yes—in fact, it matters even more. Advanced models are capable of complex multi-step reasoning, architectural planning, and nuanced styling, but they require structured instructions to activate those latent capabilities without hallucinating or making unwarranted assumptions.",
  },
  {
    question: "What is chain-of-thought prompting?",
    answer:
      "Chain-of-thought (CoT) prompting instructs the model to break down complex problems and reason step-by-step before producing a final conclusion. Adding phrases like 'Think step-by-step and show your reasoning before presenting the final answer' dramatically reduces arithmetic and logic errors.",
  },
  {
    question: "How do prompts differ between text LLMs and image generators like Midjourney?",
    answer:
      "Text LLMs understand conversational grammar, role-playing, and explicit negative constraints ('do not include X'). Image models like Midjourney or Stable Diffusion respond to descriptive keywords, camera lenses, lighting ratios, medium textures, and specialized parameter flags (--ar 16:9, --v 6.0) rather than conversational prose.",
  },
  {
    question: "What are few-shot prompts?",
    answer:
      "Few-shot prompts provide 2 to 3 high-quality input-output examples directly inside the prompt before asking the model to process a new input. This anchors the model's tone, syntax, and formatting far more effectively than descriptive text rules alone.",
  },
];

export const PRICING_FAQS: FaqItem[] = [
  {
    question: "What payment methods are supported?",
    answer:
      "We support all major payment methods globally. In India: UPI (Google Pay, PhonePe, Paytm), credit/debit cards, and Netbanking via Razorpay. Internationally: Visa, Mastercard, American Express, Apple Pay, and PayPal via Stripe.",
  },
  {
    question: "Can I cancel my Pro subscription anytime?",
    answer:
      "Yes. You can cancel your subscription at any time with one click from your account dashboard. You will continue to have full Pro access until the end of your current billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes. We offer a no-questions-asked 7-day money-back guarantee on all Pro plans if you are not completely satisfied with PromptX. Review our full Refund Policy for details.",
  },
  {
    question: "What happens if I stay on the Free plan?",
    answer:
      "The Free plan is free forever. You get 10 enhanced prompts daily, full access to our public template library, and one-click copy buttons without entering a credit card.",
  },
  {
    question: "Do you offer team and enterprise discounts?",
    answer:
      "Yes. For teams with 5 or more members, we offer centralized billing, workspace prompt sharing, and custom model style presets. Contact our team via the For Teams page.",
  },
];
