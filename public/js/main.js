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
          items: 5,
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

  // //------- Price Range slider -------//
  // if (document.getElementById("price-range")) {
  //   var nonLinearSlider = document.getElementById("price-range");

  //   noUiSlider.create(nonLinearSlider, {
  //     connect: true,
  //     behaviour: "tap",
  //     start: [500, 4000],
  //     range: {
  //       // Starting at 500, step the value by 500,
  //       // until 4000 is reached. From there, step by 1000.
  //       min: [0],
  //       "10%": [500, 500],
  //       "50%": [4000, 1000],
  //       max: [10000],
  //     },
  //   });

  //   var nodes = [
  //     document.getElementById("lower-value"), // 0
  //     document.getElementById("upper-value"), // 1
  //   ];

  //   // Display the slider value and how far the handle moved
  //   // from the left edge of the slider.
  //   nonLinearSlider.noUiSlider.on(
  //     "update",
  //     function (values, handle, unencoded, isTap, positions) {
  //       nodes[handle].innerHTML = values[handle];
  //     }
  //   );
  // }
  $('#form-search').on('submit', function (e) {
    const keyword = $('#input-search').val();
    if (keyword.length <= 2) {
        Swal.fire({
            title: 'Error!',
            text: 'Keyword must have more than 2 character',
            icon: 'error',
            confirmButtonText: 'Retry'
        }).then(function () {
            $('#input-search').val("");
        });
        return;
    }
    else {
      $('#form-search').off('submit').submit();
    }
  });

  $(document).ready(function() {
    $('select').niceSelect();
  });

  let urlParams= new URLSearchParams(location.search);
  let params={
    search: "",
    sort: ""
  };

  for (let key in params){
    if(!urlParams.has(key)){
      urlParams.append(key,params[key]);
    }
  }

  function selectParams(key,value){
    urlParams.set(key,value);
    let url= `/courses/search/?=${urlParams.toString()}`;
    location.href=url;
  }
});


