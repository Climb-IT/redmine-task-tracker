function Button(props) {
  const { children, onClick } = props;
  return (
    <button onClick={onClick} class={`form-btn ${props.class}`.trim()}>
      {children}
    </button>
  );
}

export default Button;
