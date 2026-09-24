import { NextRequest, NextResponse } from "next/server";

const VDIM_BASE_URL = "https://tire.vdim.app/api/v1";

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");

  const year = request.nextUrl.searchParams.get("year");
  const make = request.nextUrl.searchParams.get("make");
  const model = request.nextUrl.searchParams.get("model");
  const trim = request.nextUrl.searchParams.get("trim");

  const apiKey = process.env.VDIM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "VDIM API key is not configured." },
      { status: 500 }
    );
  }

  let url = "";

  if (action === "make") {
    if (!year) {
      return NextResponse.json(
        { error: "Year is required." },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      year,
    });

    url = `${VDIM_BASE_URL}/by_vehicle/make?${params.toString()}`;
  } else if (action === "model") {
    if (!year || !make) {
      return NextResponse.json(
        { error: "Year and make are required." },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      year,
      make,
    });

    url = `${VDIM_BASE_URL}/by_vehicle/model?${params.toString()}`;
  } else if (action === "trim") {
    if (!year || !make || !model) {
      return NextResponse.json(
        { error: "Year, make, and model are required." },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      year,
      make,
      model,
    });

    url = `${VDIM_BASE_URL}/by_vehicle/trim?${params.toString()}`;
  } else if (action === "fitment") {
    if (!year || !make || !model || !trim) {
      return NextResponse.json(
        { error: "Year, make, model, and trim are required." },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      year,
      make,
      model,
      trim,
    });

    url = `${VDIM_BASE_URL}/tire_dimensions?${params.toString()}`;
  } else {
    return NextResponse.json(
      { error: "Invalid action." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to retrieve vehicle information." },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (action === "fitment") {
      const tireSizes = data.dimensions.map(
        (tire: {
          width: number;
          aspectratio: number;
          diameter: number;
        }) =>
          `${tire.width}/${tire.aspectratio}R${tire.diameter}`
      );

      return NextResponse.json({
        year,
        make,
        model,
        trim,
        tireSizes,
      });
    }

    const options = Object.values(data.data).map((item) => {
      const value = item as Record<string, string>;

      return value[action];
    });

    return NextResponse.json(options);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to the vehicle service." },
      { status: 500 }
    );
  }
}