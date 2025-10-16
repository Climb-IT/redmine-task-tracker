function Section(props) {
  const { title, children, classContent } = props;
  return (
    <div class="section">
      <p class="section-title">
        {typeof title === "function" ? title() : title}
      </p>
      <div class={`section-content ${classContent}`.trim()}>{children}</div>
    </div>
  );
}

export default Section;
