const board = document.querySelector("#concept-board");

document.querySelectorAll(".grade-row").forEach((button) => {
  button.addEventListener("click", () => {
    const grade = board.dataset.active === button.dataset.grade ? "" : button.dataset.grade;
    board.dataset.active = grade;
    document.querySelectorAll(".grade-row").forEach((row) => {
      row.setAttribute("aria-pressed", String(row.dataset.grade === grade));
    });
    document.querySelectorAll(".metric-row").forEach((row) => {
      row.classList.toggle("is-active", row.dataset.grade === grade);
    });
  });
});
