

$('.checkbox').on("click", function () {
  this.classList.add("checkbox--checked");
  this.innerHTML = '                <svg width="18px" height="18px" viewBox="0 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
    '                    <g stroke="none" stroke-width="1" fill-rule="evenodd">\n' +
    '                        <polygon id="icon" fill="white" points="7.13636364 11.9104478 4.03409091 8.7761194 3 9.82089552 7.13636364 14 16 5.04477612 14.9659091 4"></polygon>\n' +
    '                    </g>\n' +
    '                </svg>'

  $.ajax(`/api/tasks/${this.nextElementSibling.innerText}/done`, {
    method: 'POST'
  })
    .then(() => {
      this.parentElement.remove();
    })
    .catch(() => {
      alert("Unexpected error happened! Please implement endpoints!")
    });
})
