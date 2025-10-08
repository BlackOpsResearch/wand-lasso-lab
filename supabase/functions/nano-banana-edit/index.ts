import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { baseImage, maskImage, prompt, mode = 'edit' } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Nano Banana ${mode} request:`, {
      promptLength: prompt.length,
      hasMask: !!maskImage,
      hasBaseImage: !!baseImage
    });

    // Prepare content array for multimodal input
    const content: any[] = [
      { type: "text", text: prompt }
    ];

    // Add base image if provided (for editing)
    if (baseImage) {
      content.push({
        type: "image_url",
        image_url: { url: baseImage }
      });
    }

    // Add mask image if provided (for targeted editing)
    if (maskImage) {
      content.push({
        type: "image_url",
        image_url: { url: maskImage }
      });
    }

    // Call Lovable AI Gateway with Gemini 2.5 Flash Image (Nano Banana)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: content
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI generation failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Nano Banana response received:', {
      hasImages: !!data.choices?.[0]?.message?.images,
      imageCount: data.choices?.[0]?.message?.images?.length || 0
    });

    // Extract the generated image
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const responseText = data.choices?.[0]?.message?.content;

    if (!generatedImageUrl) {
      console.error('No image in response:', JSON.stringify(data).substring(0, 200));
      return new Response(
        JSON.stringify({ 
          error: 'No image generated', 
          message: responseText || 'Unknown error'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: generatedImageUrl,
        message: responseText
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Nano Banana error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});