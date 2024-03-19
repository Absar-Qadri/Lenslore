import ReactLoading from "react-loading";

export default function Loader({ type, color, height, width }) {
  return (
    <div className="loader">
      <ReactLoading type={type} color={color} height={height} width={width} />
    </div>
  );
}
