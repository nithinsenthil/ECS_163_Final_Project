function scaleOpacity(value) {
  if (value >= 0.7) {
    return 1;
  }
  if (value <= 0.3) {
    return 0;
  }
  return (value - 0.2) / 0.4;
}

window.addEventListener("scroll", function () {
  const num = window.scrollY / window.innerHeight;
  let x = 0;

  [...document.getElementsByClassName("section")].forEach((element) => {
    element.style.opacity = 0;
  });

  for (let target of Array.from({ length: 5 }, (_, idx) => idx)) {
    const element = document.getElementById(`section-${target + 1}`);
    const dist = Math.abs(target - num);
    element.style.opacity = scaleOpacity(1 - 2 * dist);
  }
});
