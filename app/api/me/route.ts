import { getDataFromToken } from "@/helper/getDataFromToken";

import { NextRequest, NextResponse } from "next/server";
import User from "@/model/userModel";
import { connectDB } from "@/db/mongodb";

connectDB();

export async function GET(request:NextRequest){

    try {
        const userId = await getDataFromToken(request);
        const user = await User.findOne({_id: userId}).select("-password");
        return NextResponse.json({
            mesaaage: "User found",
            data: user
        })
    } catch (error:any) {
        return NextResponse.json({error: error.message}, {status: 400});
    }

}