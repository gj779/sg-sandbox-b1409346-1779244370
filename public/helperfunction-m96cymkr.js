import { color } from "../utility/color"


export const RenderTableHeader = (headers) => {
  return (
    <thead>
      <tr style={{ textAlign: "center" }}>
        {headers.map((e, i) => <th style={{ color: color.primary }} key={i}>{e.title}</th>)}
      </tr>
    </thead>
  )
}