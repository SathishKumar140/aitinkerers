import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { image, prompt } = await request.json();
    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid base64 image data URL." },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured in .env" },
        { status: 500 },
      );
    }

    const systemPrompt = `You are Project Roam Multimodal Vision Engine. 
You analyze screenshots, menus, event flyers, tickets, or landmark photos shared by group members.
Extract structured details to help the group plan and arbitrate their outing:
1. Venue/Event Name
2. Category (e.g., Casual Vegan Bistro, Speakeasy Bar, Rooftop Lounge, Live Concert)
3. Location/Neighborhood
4. Pricing/Budget Tier ($: under $20, $$: $20-$40, $$$: $40+)
5. Dietary & Allergen tags found (e.g., Vegan, Gluten-Free, Halal, Nut-Free, Dairy-Free, None)
6. Recommended highlights and standout items
7. Group Fit: explain why this spot/event works for groups with varied constraints.

Format your output as clean JSON with these keys:
{
  "title": string,
  "category": string,
  "location": string,
  "priceTier": string,
  "dietaryTags": string[],
  "highlights": string[],
  "groupFit": string,
  "summary": string
}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.MODEL || "gpt-5.1",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  prompt ||
                  "Extract all venue, menu, dietary, pricing, and event details from this image.",
              },
              {
                type: "image_url",
                image_url: { url: image },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `OpenAI Vision error: ${err}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return NextResponse.json({ success: true, result: parsed });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze image with vision.",
      },
      { status: 500 },
    );
  }
}
