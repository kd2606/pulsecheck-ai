import { NextRequest, NextResponse } from "next/server";
import { sarvamSTT } from "@/ai/sarvam";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as Blob;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const result = await sarvamSTT(file);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error("STT API Error:", error);
        return NextResponse.json({ error: error.message || "STT failed" }, { status: 500 });
    }
}
