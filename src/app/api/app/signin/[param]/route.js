import { NextRequest, NextResponse } from "next/server";
import { 
    sendOtp, 
    verifyOtp, 
    mandatoryDetails, 
    getStudentDetails,
    getChapterDetails,
    getSegments
} from '../../../../../../server_actions/actions/studentActions'
export async function POST(request, { params }) {
    const formData = await request.formData()
    const {param} = params
    // console.log(params)
    
    switch(param) {

        case 'sendOtp':
            const response = await sendOtp(formData.get('phone'))
            if(response.success){
                return NextResponse.json(response)
            }
            return NextResponse.json(verifyResponse)

        case 'verifyOtp':
            const verifyResponse = await verifyOtp({
                mobile: formData.get('mobile'),
                otp: formData.get('otp')
            })
            if(verifyResponse.success){
                return NextResponse.json(verifyResponse)
            }
            return NextResponse.json(verifyResponse)

        case 'mandatoryDetails':
            const mandatoryDetailsResponse = await mandatoryDetails({
                name: formData.get('name'),
                email: formData.get('email'),
                token: formData.get('token'),
            })
            if(mandatoryDetailsResponse.success){
                return NextResponse.json(mandatoryDetailsResponse)
            }
            return NextResponse.json(mandatoryDetailsResponse)

        case 'getStudentDetails':
            const getStudentDetailsResponse = await getStudentDetails(formData.get('token'))
            if(getStudentDetailsResponse.success){
                return NextResponse.json(getStudentDetailsResponse)
            }
            return NextResponse.json(getStudentDetailsResponse)

        case 'getChapterDetails':
            const getChapterDetailsResponse = await getChapterDetails({
                chapterId: formData.get('chapterId'),
                token: formData.get('token')
            })
            if(getChapterDetailsResponse.success){
                return NextResponse.json(getChapterDetailsResponse)
            }
            return NextResponse.json(getChapterDetailsResponse)

        case 'getSegments':
            const getSegmentsResponse = await getSegments()
            if(getSegmentsResponse.success){
                return NextResponse.json(getSegmentsResponse)
            }
            return NextResponse.json(getSegmentsResponse)

        default:
            return NextResponse.json({
                success: false,
                message: 'Invalid function name'
            })
    }
    
}