/**
 * Add event listener to initiate opacity and position animations.
 * The result lets the content on the page be "scrolljacked" to animate
 * in and out of the center of page, depending on the scroll distance the user
 * is at.
 */
window.addEventListener("scroll", function () {
  const scrollAmount = window.scrollY / window.innerHeight;

  // Iterate over all 5 sections
  for (let target of Array.from({ length: 6 }, (_, idx) => idx)) {
    const element = document.getElementById(`section-${target + 1}`);
    const dist = target - 5 * scrollAmount;

    // Didn't get to this section yet, place it below the page
    if (dist > 0.5) {
      element.style.opacity = "0";
      element.style.transform = "translateY(100vh)";
    }

    // Scrolled past this section already, place it above the page
    else if (dist < -0.5) {
      element.style.opacity = "0";
      element.style.transform = "translateY(-100vh)";
    }

    // Currently at this section. Make it visible and place it on the page
    else {
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }
  }
});
