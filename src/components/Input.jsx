function Input(props) {
  const { label, id, type, value, onChange } = props;
  return (
    <>
      <label for={id}>{label}</label>
      <input
        type={type}
        id={id}
        class="mb-2"
        value={value}
        onChange={onChange}
      />
    </>
  );
}

export default Input;
