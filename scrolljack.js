let currentSection = 0;
const scrollButton = document.getElementById("scroll-button");

/**
 * Based on the current scroll position,
 * calculate which sections to show or not show and modify section opacities/positions.
 * Also hide/show the scroll button conditionally.
 */
function scrollEffect() {
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
      currentSection = target;
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }
  }

  // Hide/show the scroll button conditionally
  if (currentSection === 5) {
    scrollButton.style.display = "none";
  } else {
    scrollButton.style.display = "block";
  }
}

// Run scrollEffect on script load
// This ensures if the user refreshes halfway through the page,
// the correct content will be loaded in.
scrollEffect();

/**
 * Add event listener to initiate opacity and position animations.
 * The result lets the content on the page be "scrolljacked" to animate
 * in and out of the center of page, depending on the scroll distance the user
 * is at.
 */
window.addEventListener("scroll", scrollEffect);

/**
 * When the scroll button is clicked, calculate the position of the next section
 * and jump the scroll to it.
 */
scrollButton.addEventListener("click", () => {
  const nextSection = currentSection + 1;
  const nextScrollAmount = nextSection * 0.2 * window.innerHeight;
  window.scrollTo(0, nextScrollAmount);
});
