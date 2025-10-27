export default function Icon(props) {
  return (
    <button
      class={`icon ${props.class || ""}`.trim()}
      classList={props.classList}
      onClick={props.onClick}
      style={{
        "--icon-size": props.size || "24px",
        "--icon-color": props.color || "#fff",
      }}
    >
      {props.children}
    </button>
  );
}
