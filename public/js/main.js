$(function () {
  "use strict";

  if ($(".owl-carousel").length > 0) {
    $(".myCarousel").owlCarousel({
      loop: true,
      margin: 30,
      nav: true,
      navText: [
        "<i class='ti-arrow-left'></i>",
        "<i class='ti-arrow-right'></i>",
      ],
      dots: false,
      responsive: {
        0: {
          items: 1,
          nav: true,
        },
        600: {
          items: 3,
          nav: false,
        },
        1000: {
          items: 4,
          nav: true,
          loop: false,
        },
      },
    });
  }

  //------- single product area carousel -------//
  $(".s_Product_carousel").owlCarousel({
    items: 1,
    autoplay: false,
    autoplayTimeout: 5000,
    loop: true,
    nav: false,
    dots: false,
  });

  $("#form-search").on("submit", function (e) {
    const keyword = $("#input-search").val();
    if (keyword.length <= 2) {
      Swal.fire({
        title: "Error!",
        text: "Keyword must have more than 2 character",
        icon: "error",
        confirmButtonText: "Retry",
      }).then(function () {
        $("#input-search").val("");
      });
      return;
    } else {
      $("#form-search").off("submit").submit();
    }
  });

  $("select").niceSelect();

  let urlParams = new URLSearchParams(location.search);
  let params = {
    search: "",
    sort: "",
  };

  for (let key in params) {
    if (!urlParams.has(key)) {
      urlParams.append(key, params[key]);
    }
  }

  function selectParams(key, value) {
    urlParams.set(key, value);
    let url = `/courses/search/?=${urlParams.toString()}`;
    location.href = url;
  }
});
