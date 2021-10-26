/**
 * @class Model
 *
 * Manages the data of the application.
 */
class Model {
  #contacts;

  constructor() {
    this.#contacts = [
      {
        "id": 1,
        "full_name": "Arthur Dent",
        "email": "dent@example.com",
        "phone_number": "12345678901",
        "tags": "work,business"
      },
      {
        "id": 2,
        "full_name": "George Smiley",
        "email": "smiley@example.com",
        "phone_number": "12345678901",
        "tags": null
      }
    ];
  }

  bindContactListChanged(callback) {
    this.contactListChanged = callback;
  }

  addContact(name, email, phone, tagsArr) {
    const id = this.#contacts.length > 0 ? this.#contacts[this.#contacts.length - 1].id + 1 : 1;
    const tagsStr = tagsArr ? tagsArr.join(',') : null;
    this.#contacts.push({ id: id,
                         full_name: name, 
                         email: email,
                         phone_number: phone,
                         tags: tagsStr
                       });
    this.contactListChanged(this.getAllContacts());
  }

  deleteContact(id) {
    const contactIdx = this.#contacts.findIndex(contact => contact.id === id);
    if (contactIdx >= 0) this.#contacts.splice(contactIdx, 1);
  }

  updateContact(id, name, email, phone, tagsArr) {
    const tagsStr = tagsArr ? tagsArr.join(',') : null;
    const contactIdx = this.#contacts.findIndex(contact => contact.id === id);
    this.#contacts[contactIdx] = {
                                  id: id,
                                  full_name: name,
                                  email: email,
                                  phone_number: phone,
                                  tags: tagsStr
                                };
  }

  getAllContacts() {
    return this.#contacts.map(contact => this.#copyContact(contact));
  }

  getContact(id) {
    const contact = this.#contacts.find(contact => contact.id === id);
    return this.#copyContact(contact);
  }

  getContactsWithTags(tags) {
    let contacts = this.getAllContacts();
    if (tags.length === 0) return contacts;

    return contacts.filter(contact => {
      if (!contact['tags']) return false;
      const contactTags = contact['tags'].split(',');
      
      let foundEveryTag = true;
      tags.forEach(tag => {
        if (!contactTags.find(contactTag => contactTag === tag)) foundEveryTag = false;
      }); 

      return foundEveryTag;
    });
  }

  getAllTags() {
    const contacts = this.getAllContacts();
    const tags = [];

    contacts.forEach(contact => {
      if (contact.tags) contact.tags.split(',').forEach(tag => tags.push(tag));
    });

    return tags;
  }

  isEmpty() {
    return this.#contacts.length === 0;
  }

  #copyContact(contact) {
    const keys = Object.keys(contact);
    const copy = {};
    keys.forEach(key => copy[key] = contact[key]);
    return copy;
  }

}

/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
  constructor() {
    this.mainView = document.querySelector('#main-view');
    this.contactsTemplate = Handlebars.compile(document.querySelector('#contactsTemplate').innerHTML);

    // Add noContactView 
    this.noContactView = this.#generateNoContactView();
    this.mainView.insertAdjacentElement('afterend', this.noContactView);

    // Add contact list
    this.contactListView = this.#generateContactView();
    this.mainView.appendChild(this.contactListView);
    this.contactListElem = document.querySelector('#contactList ul');

    // Generate edit and add forms
    //this.editContactForm = this.#generateFormView('Edit Contact', 'edit-form');
    //this.addContactForm = this.#generateFormView('Add Contact', 'add-form');
  }

  displayContacts(contacts) {
    this.#contactsReset();

    const contactElements = this.contactsTemplate({contacts: contacts});
    this.contactListElem.insertAdjacentHTML('afterbegin',contactElements);

    this.noContactView.classList.add('hidden');
  }

  displayNoContactView() {
    this.mainView.classList.add('hidden');
    this.noContactView.classList.remove('hidden');
  }

  /* BINDING */
  bindDeleteContact(handler) {
    $('#contactList ul').on('click', '.delete-contact', e => {
      e.preventDefault();
      const li = e.target.parentNode;
      const id = Number(li.getAttribute('data-id'));
      console.log(id);
      handler(id);
    });
  }

  bindAddContact(handler) {
    const submitBtn = document.querySelector('#add-contact-btn');
    const addForm = document.querySelector('#add-contact-form');

    submitBtn.addEventListener('click', e => {
      const name = addForm.querySelector('#nameInput').value;
      const email = addForm.querySelector('#emailInput').value;
      const telephone = addForm.querySelector('#telInput').value;
      let tags = addForm.querySelector('#tagsInput').value;
      tags = tags ? tags.split(', ') : null;

      handler(name, email, telephone, tags);
      this.#clearFormInputs(addForm);

    });

  }

  /* PRIVATE METHODS */
  #clearFormInputs(form) {
    form.querySelectorAll('input').forEach(input => input.value = '');
  }

  #contactsReset() {
    this.contactListElem.innerHTML = '';
  }

  #generateNoContactView() {
    const section = document.createElement('section');
    section.classList.add('row');
    section.id = 'noContactsView';
    const innerHTML = `<div class="card">
                        <div class="card-body text-center">
                          <h3 class="h3 text-center">There are no contacts</h3>
                          <button type="button" class="btn btn-outline-dark add-contact">Add Contact</button>
                        </div>
                      </div>`;
    
    section.insertAdjacentHTML('afterbegin', innerHTML);
    return section;
  }

  #generateContactView() {
    const section = document.createElement('section');
    section.id = 'contactList';
    const innerHTML = `<ul class="row"></ul>`;
    section.insertAdjacentHTML('afterbegin', innerHTML);
    return section;
  }

}

/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    if (this.model.isEmpty()) {
      this.view.displayNoContactView();
    } else {
      this.view.displayContacts(this.model.getAllContacts());
    }

    this.model.bindContactListChanged(this.handleContactListChanged);
    this.view.bindDeleteContact(this.handleDeleteContact);
    this.view.bindAddContact(this.handleAddContact);
  }

  handleContactListChanged = contacts => {
    this.view.displayContacts(contacts);
  }

  handleDeleteContact = (id) => {
    this.model.deleteContact(id);
    console.log(this.model.getAllContacts());
  }

  handleAddContact = (name, email, phone, tagsArr) => {
    this.model.addContact(name, email, phone, tagsArr);
    console.log(this.model.getAllContacts());
  }

}

const app = new Controller(new Model(), new View());