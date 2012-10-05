(function($){
    var Contacts = {};
    Contacts.util = {};
    Contacts.storage = {};
    
    Contacts.storage.getAll = function() {
        var storedContacts = window.localStorage.getItem("Contacts");
        console.log(storedContacts);
        if (storedContacts === null) {
            return [];
        }
        else {
            return JSON.parse(storedContacts);
        }
    };

    Contacts.storage.addContact = function(contact) {
        var storedContacts = Contacts.storage.getAll();
        storedContacts.push(contact);
        window.localStorage.setItem("Contacts", JSON.stringify(storedContacts));
        console.log(contact);
    }

    /**
     * Register an event handler for a certain page onPageBeforeChange
     *
     * The event handler registration supports the handling of parameters
     * using the data-params attribute
     */
    Contacts.util.registerPageBeforeChange = (function() {
        var currentParams = {};

        // Register basic data-params handler for all links
        $('a').live('click', function(e) {
            var params = $(e.target).closest('a').attr('data-params');
            currentParams = (params === undefined) ? {} : $.parseJSON(params);
            console.log(params, currentParams);
        });

        var pageBeforeChange = function(fn, e, data) {
            data.parameters = currentParams;
            fn(e, data);
        };

        return function(pageSelector, fn) {
            $(document).on("pagebeforechange.contacts", function(e, data) {
                if (typeof data.toPage === "string") {
                    return;
                }
                if (!data.toPage.is(pageSelector)) {
                    return;
                }

                pageBeforeChange(fn, e, data);
            })
        };
    })();

    /**
     * View: list
     *
     * Handle listing of names from localstorage, either by first or lastname
     */
    Contacts.util.registerPageBeforeChange("#list", (function(){
        var updateDetailedView = function(contact) {
            var page = $("#view");
            ["firstname", "lastname", "mail", "phone", "address"].forEach(function(field) {
                $(".contact-" + field, page).text(contact[field]);
            });
        };

        var renderContacts = function(contacts, listview, data) {
            contacts.forEach(function(contact) {
                var name;

                if (data.parameters.order === "lastname") {
                    name = "<b>" + contact.lastname + "</b>, " + contact.firstname;
                }
                else {
                    name = "<b>" + contact.firstname + "</b> " + contact.lastname;
                }
                
                listview.append(
                    $('<li/>').append(
                        $('<a />', {
                            'href': "#view",
                            'html': name,
                            'data-rel': 'dialog'
                        }).on(
                            'click.contacts',
                            function() {
                                updateDetailedView(contact);
                            }
                        )
                    )
                );
            });
        };

        return function(e, data) {
            var page = data.toPage;
            var contacts = Contacts.storage.getAll();
            var listview = $(".contacts-list", page);

            // Display the active toolbar button
            if (data.parameters.order === "lastname") {
                $('a.lastname', page).addClass('ui-btn-active');
                $('a.firstname', page).removeClass('ui-btn-active');
            }
            else {
                $('a.firstname', page).addClass('ui-btn-active');
                $('a.lastname', page).removeClass('ui-btn-active');
            }

            listview.empty();
            renderContacts(contacts, listview, data);
            listview.listview('refresh');
        };
    })());


    /**
     * View: add
     *
     * Register all the needed stuff upon "new" creation
     */
    $(document).on("pageinit.contacts", function(e) {
        var page = $(e.target);
        if (!page.is("#add")) {
            return;
        }

        // Handle storage of new contact
        $(".contact-save", page).on('click.contacts', function(e) {
            var contact = {};
            ["firstname", "lastname", "mail", "phone", "address"].forEach(function(field) {
                contact[field] = $("#contact-" + field, page).val();
            });

            Contacts.storage.addContact(contact);
        });
    });

})(jQuery);
