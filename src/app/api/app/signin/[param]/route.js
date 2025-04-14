import { NextRequest, NextResponse } from "next/server";
import { sendOtp } from '../../../../../../server_actions/actions/adminActions'
export async function POST(request, { params }) {
    // const formData = await request.formData()
    const {param} = params
    console.log(param)
    
    return NextResponse.json({
        success: true,
    })
}