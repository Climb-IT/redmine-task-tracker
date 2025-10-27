function Section(props) {
  const { title, children, classContent, color } = props;
  return (
    <div class="section" style={{ "--section-color": color }}>
      <p class="section-title">
        {typeof title === "function" ? title() : title}
      </p>
      <div class={`section-content ${classContent || ""}`.trim()}>
        {children}
      </div>
    </div>
  );
}

export default Section;
