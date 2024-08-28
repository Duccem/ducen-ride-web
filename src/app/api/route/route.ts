import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
const apiKey = process.env.HERE_API_KEY!;
export const POST = async (req: NextRequest) => {
  try {
    const {
      origin_latitude,
      origin_longitude,
      destination_latitude,
      destination_longitude,
    } = await req.json();
    const url = `https://routematching.hereapi.com/v8/calculateroute.json?apiKey=${apiKey}&waypoint0=geo!${origin_latitude},${origin_longitude}&waypoint1=geo!${destination_latitude},${destination_longitude}&mode=fastest;car;traffic:disabled&legAttributes=shape`;
    const response = await axios.get(url);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
