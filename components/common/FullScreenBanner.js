export default function FullScreenBanner(props) {
    return(
        <div className="w-full max-w-full mt-24 overflow-hidden">
            <img src={`${props.url}`} alt="Banner" className="w-full aspect-[10/2] object-cover" />
        </div>
    )
}