window.addEventListener("scroll", function () {
  const num = window.scrollY / window.innerHeight;
  let x = 0;

  for (let target of Array.from({ length: 5 }, (_, idx) => idx)) {
    const element = document.getElementById(`section-${target + 1}`);
    const dist = target - 4 * num;
    if (dist > 0.5) {
      element.style.opacity = "0";
      element.style.transform = "translateY(100vh)";
    } else if (dist < -0.5) {
      element.style.opacity = "0";
      element.style.transform = "translateY(-100vh)";
    } else {
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }
  }
});
