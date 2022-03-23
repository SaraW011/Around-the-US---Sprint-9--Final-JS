import "regenerator-runtime/runtime";
import "./index.css";
import Api from "../components/Api.js";
import FormValidator from "../components/FormValidator.js";
import Card from "../components/Card.js";
import PopupWithForm from "../components/PopupWithForm.js";
import PopupWithImage from "../components/PopupWithImage.js";
import PopupConfirmDelete from "../components/PopupConfirmDelete.js";
import Section from "../components/Section.js";
import UserInfo from "../components/UserInfo.js";

import {
  profileAvatarImage,
  editProfilePopup,
  addNewPlacePopup,
  previewImagePopup,
  editAvatarPopup,
  confirmDeleteForm,
  placeForm,
  profileForm,
  avatarForm,
  userNameElement,
  userJobElement,
  inputName,
  inputJob,
  inputUrlForm,
  inputPlaceNameForm,
  openProfileEditButton,
  saveProfileEditButton,
  addNewPlacePopupButton,
  addNewPlaceSaveButton,
  openAvatarPopupButton,
  confirmDeleteButton,
  saveAvatarButton,
  placesList,
  templateSelector,
  fieldset,
} from "../utils/constants.js";

//**-->> API <<--*/
const api = new Api({
  baseUrl: "https://around.nomoreparties.co/v1/group-12",
  headers: {
      authorization: "b211c19a-1dd2-41b6-b48a-d98d5e63db67",
      "Content-Type": "application/json"
  }
});


//========================================================

const userInfo = new UserInfo(
  userNameElement, userJobElement, profileAvatarImage
);

function fetchData() {
  api
    .getUserData()
    .then((data) => {
      userInfo.setUserInfo(data.name, data.about);
      userInfo.setUserAvatar(data.avatar);
      loadInitialCards(data._id);
    })
    .catch((err) => {
      console.log(err.status, err.statusText);
      alert(err);
    });
}


function loadInitialCards(userId) {
  api
    .getInitialCards()
    .then((cards) => {
      elementsList.renderer(cards, userId);
    })
    .catch((err) => {
      console.log(err.status, err.statusText);
      alert(err);
    });
}

window.onload = () => {
  fetchData();
};

//================================================= SECTION
// new card
function renderCard(data) {
  const card = new Card(
    data,
    userInfo,
    templateSelector,
    handleImagePreview,
    likePlaceCard,
    dislikePlaceCard,
    confirmDeletionPopup
  );
  return card.render();
}

// const elementsList = new Section(
//   {renderer: renderCard},
//   placesList // ul
// );

const elementsList = new Section(
  {
    renderer: (element) => {
      const newCard = renderCard(element);
      elementsList.addItem(newCard);
    },
  },
  placesList
);

//**-->> CARD FUNCTIONS <<----------------------------------*/

function handleImagePreview(link, name) {
  previewImage.open(link, name);
}

const confirmDeletionPopup = new PopupConfirmDelete(
  confirmDeleteForm,
  confirmDeleteButton,
  confirmDeletePlaceCard
);

function confirmDeletePlaceCard(cardId) {
  confirmDeletionPopup.open();
  api
    .deleteCard(cardId)
    .then(() => {
      place.remove();
      place = null;
      confirmDeletionPopup.close();
    })
    .catch((err) => {
      console.log(err.status, err.statusText);
    });
}

// like card
function likePlaceCard() {  // check cardId ------------->>>>>!!!!!!
  api
    .likeCard(like)
    .then((card) => {
      console.log(card.likes);
      // like.textContent = card.likes.length;
      // event.target.classList.add('elements__heart_active');
    })
    .catch((err) => {
      console.log(err.status, err.statusText);
    });
}

// //dislike card
function dislikePlaceCard() {
  api
    .dislikeCard(dislike)
    .then((card) => {
      console.log(card.likes);
      // dislike.textContent = card.likes.length; //likes form url path
      // event.target.classList.remove("elements__heart_active");
    })
    .catch((err) => {
      console.log(err.status, err.statusText);
    });
}

// **-->> FORMS <<---------------------------------------------------------------*/
// Project 9: all forms submitted are now linked to api and have promise chains:

//edit avatar form -----------------------------------------------
const editAvatar = new PopupWithForm(editAvatarPopup, editAvatarForm);
editAvatar.setEventListeners();

function editAvatarForm(event) {
  event.preventDefault();
  saveAvatarButton.textContent = "saving...";
  api
    .editAvatar(inputUrlForm.value)
    .then((user) => {
      // might need to put into object brackets
      userInfo.setUserAvatar(user.avatar);
      editAvatarPopup.close();
    })
    .catch((err) => {
      console.log(err.status, err.statusText);
    })
    .finally(() => {
      saveAvatarButton.textContent = "Save";
    });
}

// add new place-card form --------------------------------------
const addPlacePopup = new PopupWithForm(addNewPlacePopup, submitNewPlaceForm);
addPlacePopup.setEventListeners();

function submitNewPlaceForm() {
  addNewPlaceSaveButton.textContent = "Saving...";
  api.getUserData()
  .then(userData => {
  api
    .addPlaceCard(inputPlaceNameForm.value, inputUrlForm.value) // might need to spesify url for each form?????
    .then(
      ((card) => {
        elementsList.addItem(card, userData._id);
        addPlacePopup.close();
      })
        .catch((err) => {
          console.log(err.status, err.statusText);
        })
        .finally(() => {
          addNewPlaceSaveButton.textContent = "Create";
        })
    );
  })
}

// update user profile-info form:
const profileModal = new PopupWithForm(editProfilePopup, submitProfileForm);
profileModal.setEventListeners();

function submitProfileForm(event, inputs) {
  event.preventDefault();
  saveProfileEditButton.textContent = "Saving...";
  api
    .editUserInfo(inputs.name, inputs.about) //html inputs
    .then((user) => {
      userInfo.setUserInfo(
          user.name,
          user.about,   
      );
      profileModal.close();
    })
    .catch((err) => {
      console.log(err.status, err.statusText);
    })
    .finally(() => {
      saveProfileEditButton.textContent = "Save";
    });
}

//---->>>>>>  holds initial values inside profile form when open:
function currentProfileName() {
  //-----get data from UserInfo class:
  const inputData = userInfo.setUserInfo();
  inputName.value = inputData.name;
  inputJob.value = inputData.about;
  //call @ eventListener
}
//<<<<<<----
//preview image:
const previewImage = new PopupWithImage(previewImagePopup);
previewImage.setEventListeners();

//**-->> ENABLE FORM VALIDATION <<--*/

const placeFormValidator = new FormValidator(fieldset, placeForm);
placeFormValidator.enableValidation();

const profileFormValidator = new FormValidator(fieldset, profileForm);
profileFormValidator.enableValidation();

const avatarFormValidator = new FormValidator(fieldset, avatarForm);
avatarFormValidator.enableValidation();

// **-->> EVENT LISTENERS <<--*/

openProfileEditButton.addEventListener("click", () => {
  profileModal.open();
  currentProfileName();
});

addNewPlacePopupButton.addEventListener("click", () => {
  addPlacePopup.open();
  placeFormValidator.disableSubmitButton();
});

openAvatarPopupButton.addEventListener("click", () => {
  editAvatar.open();
  avatarFormValidator.disableSubmitButton();
});