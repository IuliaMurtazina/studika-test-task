import axios from "axios";
import axiosStudika from "../../axios-instance";
import sprite from "../images/sprite.svg";

class Region {
  location = document.querySelector(".location");
  region = document.querySelector(".region");
  regionContainer = document.querySelector(".region__container");
  regionListContainer = document.querySelector(".region__list");
  regionSelectedContainer = document.querySelector(".region__selected");
  spinner = document.querySelector(".spinner");
  regionSearchInput = document.querySelector(".region__input");
  searchButtonDelete = document.querySelector(".region__search-delete");
  regionSaveButton = document.querySelector(".region__save");
  _isVisible = false;
  regionsList = {};
  regionsSelected = [];

  constructor() {
    this.location.addEventListener("click", (e) => {
      const clicked = e.target.closest(".location__current");
      if (!clicked) return;

      if (!this._isVisible) this.regionShow();
      else this.regionHide();
    });

    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".region") &&
        !e.target.closest(".location__current") &&
        !e.target.closest(".region__city-delete") &&
        this._isVisible
      ) {
        this.regionHide();
      }
    });

    this.regionSearchInput.addEventListener(
      "input",
      this.regionSearch.bind(this)
    );

    this.regionListContainer.addEventListener("click", (e) => {
      this.regionActive.call(this, e);
      this.regionSelect.call(this, e);
    });

    this.searchButtonDelete.addEventListener("click", () => {
      if (!this.regionSearchInput.value) return;
      this.regionSearchInput.value = "";
      this.regionSearch();
    });

    this.regionSelectedContainer.addEventListener("click", (e) => {
      this.regionDelete.call(this, e);
    });

    this.regionSaveButton.addEventListener("click", () => {
      this.fetchRegionsSelected();
      this.regionHide();
    });
  }

  regionShow() {
    this.region.style.transform = "translateY(0)";
    this.region.classList.remove("hidden");
    this._isVisible = true;

    if (!Object.keys(this.regionsList).length) {
      this.renderSpinner();
      this.renderRegionsList();
    }
  }

  regionHide() {
    this.region.style.transform = "translateY(1rem)";
    this.region.classList.add("hidden");
    this._isVisible = false;
  }

  renderSpinner() {
    const markup = `
      <div class="spinner">
        <div class="spinner__icon"></div>
      </div>
    `;
    this.regionListContainer.innerHTML = "";
    this.regionListContainer.insertAdjacentHTML("afterbegin", markup);
  }

  async fetchRegions() {
    await axiosStudika
      .post("/areas")
      .then((response) => {
        this.regionsList = response.data;
      })
      .catch((e) => {
        this.regionListContainer.innerHTML = "";
        this.regionListContainer.insertAdjacentHTML(
          "afterbegin",
          `
        <div class="region__error">
          <p class="region__error-message">Не удалось загрузить список городов...</p>
        </div>
        `
        );
        console.log(e);
      });
  }

  async renderRegionsList() {
    await this.fetchRegions();

    const regions = this.regionsList.map((region) => {
      const areaName = `<p class="region__item-city" data-area-id="${region.id}">${region.name}</p>`;
      if (!region.cities) return areaName;
      else {
        return [
          areaName,
          region.cities.map(
            (city) =>
              `<p class="region__item-city" data-city-id="${city.id}" data-area2-id="${city.state_id}">${city.name}</p> <p class="region__item-area">${region.name}</p>`
          ),
        ];
      }
    });

    const markup = regions
      .flat(2)
      .map(
        (region) => `
    <li class="region__item">${region}</li>
    `
      )
      .join("");

    this.regionListContainer.innerHTML = "";
    this.regionListContainer.insertAdjacentHTML("afterbegin", markup);

    const cookies = document.cookie;
    const splitedCookies = cookies.split("studikaRegionsSelected=")[1];
    if (splitedCookies) {
      const indexOfEndOfArray = splitedCookies.indexOf(";");
      let studikaRegionsSelectedString = "";
      if (indexOfEndOfArray != -1) {
        studikaRegionsSelectedString = splitedCookies.slice(
          0,
          indexOfEndOfArray
        );
      } else {
        studikaRegionsSelectedString = splitedCookies;
      }

      if (studikaRegionsSelectedString !== "") {
        const items = document.querySelectorAll(".region__item");
        items.forEach((item) => {
          const cookiesID = studikaRegionsSelectedString.split(",");
          const region = item.firstChild.textContent;
          const id =
            item.firstChild.dataset.areaId || item.firstChild.dataset.cityId;
          const isCity = !!item.firstChild.dataset.cityId;
          cookiesID.forEach((cookieID) => {
            if (id === cookieID) {
              item.classList.add("region__item--active");
              this.regionsSelected.push(id);
              this.regionSelectedContainer.style.display = "flex";
              this.regionSelectedContainer.insertAdjacentHTML(
                "beforeend",
                this.regionSelectMarkup(id, region, isCity)
              );
            }
          });
        });
      }
    }
  }

  regionSearch() {
    const value = this.regionSearchInput.value.trim().toLowerCase();
    const itemsCity = document.querySelectorAll(".region__item-city");

    if (value !== "") {
      this.searchButtonDelete.classList.remove("hidden");
      itemsCity.forEach((elem) => {
        if (elem.textContent.toLowerCase().search(value) === -1) {
          elem.closest(".region__item").classList.add("region__item-hide");
          elem.innerHTML = elem.textContent;
        } else {
          elem.closest(".region__item").classList.remove("region__item-hide");
          let str = elem.textContent;
          elem.innerHTML = this.regionSearchHighlight(
            str,
            elem.textContent.toLowerCase().search(value),
            value.length
          );
        }
      });
    } else {
      this.searchButtonDelete.classList.add("hidden");
      itemsCity.forEach((elem) => {
        elem.closest(".region__item").classList.remove("region__item-hide");
        elem.innerHTML = elem.textContent;
      });
    }
  }

  regionSearchHighlight(string, position, length) {
    return (
      string.slice(0, position) +
      '<span style="color:#0656B4">' +
      string.slice(position, position + length) +
      "</span>" +
      string.slice(position + length)
    );
  }

  regionActive(e) {
    const clicked = e.target.closest(".region__item");
    if (!clicked) return;

    !clicked.classList.contains("region__item--active")
      ? clicked.classList.add("region__item--active")
      : clicked.classList.remove("region__item--active");
  }

  regionSelect(e) {
    const clicked = e.target.closest(".region__item");
    if (!clicked) return;

    const region = clicked.firstChild.textContent;

    const isCity = !!clicked.firstChild.dataset.cityId;

    const id =
      clicked.firstChild.dataset.areaId || clicked.firstChild.dataset.cityId;

    if (!this.regionsSelected.some((reg) => reg === id)) {
      this.regionsSelected.push(id);

      this.regionSelectedContainer.style.display = "flex";
      this.regionSelectedContainer.insertAdjacentHTML(
        "beforeend",
        this.regionSelectMarkup(id, region, isCity)
      );
    } else {
      const selected = document.querySelectorAll(".region__select");
      selected.forEach((el) => {
        const elementId = el.dataset.areaId || el.dataset.cityId;
        if (elementId === id) el.remove();
      });
      this.regionsSelected = this.regionsSelected.filter(
        (_, i, arr) => arr[i] !== id
      );
      this.checkEmptyRegionSelectedContainer();
    }
  }

  regionSelectMarkup(id, region, isCity) {
    return `<div class="region__select" ${
      isCity ? `data-city-id="${id}` : `data-area-id="${id}`
    }">
        <p class="region__city">${region}</p>
        <svg class="region__city-delete">
          <use xlink:href="${sprite}#close"></use>
        </svg>
      </div>`;
  }

  regionDelete(e) {
    const clicked = e.target.closest(".region__city-delete");
    if (!clicked) return;
    const items = document.querySelectorAll(".region__item");
    const attribute = clicked.parentElement.dataset.cityId
      ? "cityId"
      : "areaId";

    items.forEach((item) => {
      if (
        item.firstChild.dataset[attribute] ===
        clicked.parentElement.dataset[attribute]
      )
        item.classList.remove("region__item--active");
    });

    this.regionsSelected = this.regionsSelected.filter(
      (id) => id !== clicked.parentNode.dataset[attribute]
    );
    clicked.parentNode.remove();
    this.checkEmptyRegionSelectedContainer();
  }

  checkEmptyRegionSelectedContainer() {
    if (this.regionSelectedContainer.childNodes.length === 0)
      this.regionSelectedContainer.style.display = "none";
  }

  async fetchRegionsSelected() {
    await axios
      .post(
        `https://studika-test-task-default-rtdb.firebaseio.com/regions.json`,
        this.regionsSelected
      )
      .then(() => {
        if (!!this.regionsSelected.length) {
          document.cookie = `studikaRegionsSelected=${this.regionsSelected};`;
        } else {
          document.cookie =
            "studikaRegionsSelected=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        }
      })
      .catch((error) => console.log(error));
  }
}

export default new Region();
