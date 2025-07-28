import { NextRequest, NextResponse } from "next/server";
import { 
    sendOtp, 
    verifyOtp, 
    mandatoryDetails, 
    getStudentDetails,
    getChapterDetails,
    getSegments,
    updateStudentDetails
} from '../../../../../../server_actions/actions/studentActions'

import { showBanners } from "../../../../../../server_actions/actions/adminActions";
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

        case 'updateStudentDetails':
            console.log(formData.get('token'))
            const updateStudentDetailsResponse = await updateStudentDetails({
                token: formData.get('token'),
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                gender: formData.get('gender'),
                referralCode: formData.get('referralCode'),
                address: formData.get('address'),
                area: formData.get('area'),
                city: formData.get('city'),
                state: formData.get('state'),
                dob: formData.get('dob'),
            })
            if(updateStudentDetailsResponse.success){
                return NextResponse.json(updateStudentDetailsResponse)
            }
            return NextResponse.json(updateStudentDetailsResponse)

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

        case 'showBanners':
            const showBannersResponse = await showBanners()
            if(showBannersResponse.success){
                return NextResponse.json(showBannersResponse)
            }
            return NextResponse.json(showBannersResponse)

        default:
            return NextResponse.json({
                success: false,
                message: 'Invalid function name'
            })
    }
    
}