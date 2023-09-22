async function fetchData() {
  try {
    const response = await fetch(
      `https://ecotech.ecoterra.cl/api/products/${productSku}`, {
        method: 'GET',
        credentials: 'omit' // Esto evita que las cookies se incluyan en la solicitud
      }
    );

    const data = await response.json();
    const product = data.product;
    // llenamos los claims
    if (product.claims.length > 0) {
      product.claims.forEach((element) => {
        pushClaimIfNotExist(element);
      });
    }
    if (product.producers.length > 0) {
      product.producers.forEach((producer) => {
        if (producer.claims.length > 0) {
          producer.claims.forEach((claim) => {
            pushClaimIfNotExist(claim, producer);
          });
        }
      });
    }
   

    const tagsContainer = document.querySelector(".tags-container");
    tagsContainer.innerHTML = "";

    if (tagsContainer) {
      claims.forEach((claim) => {
        const div = createClaimDiv(claim);
        tagsContainer.appendChild(div);
      });
      // Después de crear el div "div" en la función createClaimDiv
    }

    const claimContent = document.querySelector("#claimContent");

    // const tagAssetClaims = document.querySelectorAll(".tag-asset-claim");
    // if (tagAssetClaims) {
    //   tagAssetClaims.forEach((element) => {
    //     element.addEventListener("click", () => {
    //       const elementId = element.getAttribute("data-target-id");
    //       const elementActive = document.querySelector(".claim--popup.active");
    //       const targetElement = document.querySelector(elementId);

    //       if (elementActive && elementActive !== targetElement) {
    //         elementActive.classList.remove("active");
    //       }
    //       targetElement.classList.toggle("active");

    //       // Inicializar mapa cuando se muestra el popup
    //       if (targetElement.classList.contains("active")) {
    //         initMap(elementId, product.producers);
    //       }
    //     });
    //   });
    // }

    const generalButtonClaim = document.querySelector("#ecoClaimsButton");
    const activePopup = document.querySelector("#claim--general");
    const activeContainerGeneral = document.querySelector(".tags-container--general");
    if (activeContainerGeneral && claims.length > 0) {
      activeContainerGeneral.classList.add('active');
    }
    if (generalButtonClaim && claims.length > 0) {
      generalButtonClaim.addEventListener("click", function (e) {
        e.preventDefault();
        ga(
          "send",
          "event",
          "Proof_of_eco_click",
          "Proof_of_eco_click",
          `click en producto ${productSku}`
        );
        const claimOptionActive = document.querySelector(
          ".claims--link-options.active"
        );
        if (claimOptionActive) {
          claimOptionActive.classList.remove("active");
        }
        claimContent.innerHTML = ``;
        // generalSelectClaimSpan.innerHTML = `Seleccione un claim para ver su informacion`;

        activePopup.classList.toggle("active");
      });
    }
    const buttonClose = document.querySelector("#closeButtonGeneral");
    if (buttonClose) {
      buttonClose.addEventListener("click", function (e) {
        activePopup.classList.remove("active");
      });
    }
    document.addEventListener("click", function (e) {
      const activePopup = document.querySelector("#claim--general");
      const isClickInsidePopup = activePopup.contains(e.target);
      const isClickOnButton = e.target === generalButtonClaim;
      if (!isClickInsidePopup && !isClickOnButton) {
        activePopup.classList.remove("active");
      }
    });
    const generalSelectClaim = document.querySelector("#claimGeneralSelect");

    const generalOptions = document.querySelector("#claimGeneralOptions");
    if (generalSelectClaim) {
      generalSelectClaim.addEventListener("click", function (e) {
        e.preventDefault();
        // if(!activePopup ||!activePopup?.classList?.contains('active')){
        generalOptions.classList.toggle("active");
        // }
      });
    }
    if (generalOptions) {
      const ulOptions = generalOptions.querySelector("ul");
      claims.forEach((claim) => {
        const div = document.createElement("div");
        div.innerHTML = `
    <li>
      <a class="claims--link-options" href="${claim.id}" data-target-id="${claim.templateId}">
      <img src="${claim.image}" alt="${claim.claimName}" loading="lazy" />
      <span>${claim.claimName}</span>
      </a>
    </li>
    `;
        ulOptions.appendChild(div);
      });
      const claimOptions = document.querySelectorAll(".claims--link-options");
      claimOptions.forEach((element) => {
        element.addEventListener("click", function (e) {
          e.preventDefault();
          const claimOptionActive = document.querySelector(
            ".claims--link-options.active"
          );
          if (claimOptionActive) {
            claimOptionActive.classList.remove("active");
          }

          element.classList.add("active");
          generalOptions.classList.remove("active");
          let id = element.getAttribute("data-target-id");
          const claim = claims.find((e) => e.templateId == id);
          claimContent.innerHTML = ``;
          const div = document.createElement("div");
          if (claim.claimObject == "Producto") {
            div.innerHTML = `
            <div class="claim--popup__body--head">
              <img src="${claim.image}" alt="" class="claim--popup__img" loading="lazy"/>
              <h4 class="claim--popup__subtitle">${claim.claimName}</h4>
            </div>
            <p class="claim--popup__text">
              ${claim.description}
            </p>
            <div class="claim--popup__card">
            
              <h4>¿Cómo se verifica?</h4>
              <p>${claim.claimPoE}</p>
            </div>
            ${
              claim.claimFiles.length !== 0
                ? `
            <div class="claim--popup__card" style="margin-bottom: 20px">
            <p>Fecha de Emisión: ${formatDateToDDMMYYYY(claim.validFrom)}</p>
            <p>Fecha de Validez: ${formatDateToDDMMYYYY(claim.validUntil)} </p>
              ${
                claim.recertificationDate.length !== 0
                  ? `<p>Fecha de Recertificación: ${formatDateToDDMMYYYY(
                      claim.recertificationDate
                    )}</p>`
                  : ""
              }
            </div>
            <div class="claim--popup__card">
              <h4>Evidencia:</h4>
              ${claim.claimFiles
                .filter((element) => element !== "")
                .map(
                  (element) =>
                    `<a href="${element.url}" target="_blank" rel="noopener noreferrer">Ver evidencia <svg xmlns="http://www.w3.org/2000/svg" height="0.75em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#959b03}</style><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V304H176c-35.3 0-64 28.7-64 64V512H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM176 352h32c30.9 0 56 25.1 56 56s-25.1 56-56 56H192v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V448 368c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24H192v48h16zm96-80h32c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H304c-8.8 0-16-7.2-16-16V368c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H320v96h16zm80-112c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v32h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v48c0 8.8-7.2 16-16 16s-16-7.2-16-16V432 368z"/></svg> </a><br>`
                )
                .join(" ")} 
            </div>
            `
                : ""
            }
            ${
              claim.blockchainTx.length !== 0
                ? `
                <div class="claim--popup__card">
                  <h4>Registro en Blockchain:</h4>
                    <a href="https://polygonscan.com/tx/${claim.blockchainTx}" target="_blank" rel="noopener noreferrer">Ver Registro <svg xmlns="http://www.w3.org/2000/svg" height="0.7em" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#959b03}</style><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg></a><br>
                </div>
                `
                : ""
            }
        `;
          } else {
            div.innerHTML = `
          <div class="claim--popup__body--head">
            <img src="${claim.image}" alt="" class="claim--popup__img" loading="lazy"/>
            <h4 class="claim--popup__subtitle">${claim.claimName}</h4>
          </div>
          <p class="claim--popup__text">
            ${claim.description}
          </p>
          <div id="claim--general--map" style="height: 300px; width: 100%;margin-bottom: 30px;"></div>
          <div class="claim--popup__card">
          <h4>¿Cómo se verifica?</h4>
          <p>${claim.claimPoE}</p>

          </div>
        `;
          }
          claimContent.appendChild(div);
          // generalSelectClaimSpan.innerHTML = claim.claimName;
          if (claim.claimObject !== "Producto") {
            initMap("#claim--general", product.producers, claim.templateId);
          }
          if (claimContent) {
            claimContent.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        });
      });
    }

  } catch (error) {
    console.error("Error:", error);
  }
}
function formatDateToDDMMYYYY(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function pushClaimIfNotExist(claim, producer = null) {
  const claimExists = claims.some(
    (existingClaim) => existingClaim.templateId === claim.templateId
  );
  if (!claimExists && claim.claimFiles) {
    claims.push(claim);
  }
}

function initMap(elementId, points, templateId = null) {
  var center = { lat: -33.83155, lng: -70.706332 };
  var mapOptions = {
    zoom: 10, // Nivel de zoom
    center: center, // Centro del mapa
    zoomControl: false, // Ocultar control de zoom
    mapTypeControl: false,
  };

  // Crear mapa
  var map = new google.maps.Map(
    document.querySelector(`${elementId}--map`),
    mapOptions
  );

  // Variable global para almacenar la referencia al InfoWindow actualmente abierto
  var currentInfoWindow = null;
  // Iterar sobre los puntos y agregar marcadores al mapa
  points.forEach(function (point) {
    const template = point.claims.filter((e) => e.templateId == templateId);
    console.log('point', point);
    console.log('template[0]', template[0]);
    // Crear marcador
    if(template[0]){
      var marker = new google.maps.Marker({
        position: { lat: point.location.lat, lng: point.location.lng },
        map: map,
        title: point.title,
      });
    }
    // Crear el contenido personalizado con HTML
    // '<img src="' +
    // point.imgUrl +
    // '" alt="Imagen del lugar" style="width:50px;height:50px;object-fit: cover">' +
    // <div id="bodyContent">
    // <p>
    // ${point.description}
    // </p>
    // </div>
    var contentString = `<div id="content" style="width: 200px; display:flex; flex-direction: column; gap: 10px;">
      <h2 id="firstHeading" class="firstHeading">
      ${point.name}
      </h2>
      <img src="${point.imgUrl}" style="height: 50px; width: 100px; object-fit: cover;" loading="lazy"/>
      <p>${point.description}</p>
      ${
        template[0]
          ? template[0].claimFiles
              .filter((element) => element !== "")
              .map(
                (element) =>
                  `<a href="${element.url}" target="_blank" rel="noopener noreferrer">Ver evidencia <svg xmlns="http://www.w3.org/2000/svg" height="0.75em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#959b03}</style><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V304H176c-35.3 0-64 28.7-64 64V512H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM176 352h32c30.9 0 56 25.1 56 56s-25.1 56-56 56H192v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V448 368c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24H192v48h16zm96-80h32c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H304c-8.8 0-16-7.2-16-16V368c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H320v96h16zm80-112c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v32h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v48c0 8.8-7.2 16-16 16s-16-7.2-16-16V432 368z"/></svg> </a>`
              )
              .join(" ")
          : ""
      } 
      ${
        template[0].claimFiles.length !== 0
          ? `
      <div class="claim--popup__table">
        <p class="claim--popup__table--title">Fechas</p>
        <p class="claim--popup__table--content">Emisión: ${formatDateToDDMMYYYY(
          template[0].validFrom
        )}</p>
        <p class="claim--popup__table--content">Validez: ${formatDateToDDMMYYYY(
          template[0].validUntil
        )} </p>
        ${
          template[0].recertificationDate !== 0
            ? `<p class="claim--popup__table--content">Recertificación: ${formatDateToDDMMYYYY(
                template[0].recertificationDate
              )}</p>`
            : ""
        }
      </div>
  `
          : ""
      }
      <a href="/pages/producer-landing?producer_id=1">Ver más del Productor</a>

      ${
        template[0] && template[0].blockchainTx.length !== 0
          ? `
                <a href="https://polygonscan.com/tx/${template[0].blockchainTx}" target="_blank" rel="noopener noreferrer">Ver Registro en blockchain <svg xmlns="http://www.w3.org/2000/svg" height="0.7em" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#959b03}</style><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg></a>
                `
          : ""
      }
      
      </div>
      </div>`;

    // Agregar evento click al marcador para mostrar información
    marker.addListener("click", function () {
      // Cerrar el InfoWindow actualmente abierto, si existe
      if (currentInfoWindow) {
        currentInfoWindow.close();
      }
      // Crear ventana de información
      var infoWindow = new google.maps.InfoWindow({
        content: contentString,
      });

      // Mostrar ventana de información
      infoWindow.open(map, marker);

      // Actualizar la referencia al InfoWindow actualmente abierto
      currentInfoWindow = infoWindow;
      google.maps.event.addListenerOnce(infoWindow, "domready", function () {
        var closeButton = document.querySelector(".gm-style-iw button");
        closeButton.addEventListener("click", function (e) {
          e.preventDefault();
          closeCurrentInfoWindow();
        });
      });
    });
  });
  // Capturamos todos los elementos con la clase claim__popup__open
}
// Función para cerrar el InfoWindow actualmente abierto
function closeCurrentInfoWindow() {
  const activePopup = document.querySelector("#claim--general");
  setTimeout(function () {
    activePopup.classList.add("active");
  }, 0.1);
}
function createClaimDiv(claim) {
  const div = document.createElement("div");
  div.innerHTML = `
      <div>
        <img src="${claim.image}" alt="${claim.claimName}" class="tag-asset-claim" data-target-id="#claim--${claim.templateId}" loading="eager"/>
      </div>
    `;
  return div;
}

var product = {};
var claims = [];

fetchData();
