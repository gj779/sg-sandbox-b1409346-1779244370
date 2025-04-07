import { Link } from "react-router-dom"
import { Button } from "reactstrap"
import { IoIosArrowRoundBack } from 'react-icons/io'
import { ClipLoader } from 'react-spinners';
import { color } from "../utility/color";

export const GenericButton = ({ title, to, state, style, onClick, loading, id, disabled }) => {

    return (
        <Link to={to} state={state}>
            <Button id={id} style={style} onClick={onClick} disabled={disabled}>
                {loading ? <ClipLoader size={20} color="white" loading={loading} /> : title}
            </Button>
        </Link>
    )
}
export const BackBtn = ({ to, onClick }) => {
    return (
        <Link to={to} onClick={onClick}><i><IoIosArrowRoundBack style={{
            height: "35px",
            width: '50px',
            color: '#ccc',
            background: color.primary,
            marginLeft: '-13px'

        }} />
        </i></Link>
    )
}