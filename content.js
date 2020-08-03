var META_BLOCK_SELECTOR = 'style-scope ytd-video-meta-block';
var META_BLOCK_LINK_SELECTOR = 'yt-simple-endpoint style-scope yt-formatted-string';

var TEXT_NOT_HIDDEN = 'Hide';


function insert_after(newElement, targetElement) {
    var parent = targetElement.parentNode;
    if (parent.lastChild == targetElement) {
        parent.appendChild(newElement);
    } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
    };
};


function Storage() {
    this.key = 'yhhistory';
    this.keys = [this.key];
    this.data = [];
    this.manipulated_containers = [];
    this.is_set = function(id) {
        var self = this;
        if (self.data.indexOf(id) > -1) { return true };
        return false;
    };
    this.set = function(id) {
        var self = this;

        if (self.data.indexOf(id) === -1) {
            self.data.push(id);

            var data = {};
            data[self.key] = self.data;

            chrome.storage.sync.set(data);
        };
    };
};


var _ST = new Storage();


function get_template(object) {

    // object = instance of VideoContainer

    var link_object = object.element.querySelector('#thumbnail');

    if (link_object.length === 0) { return '' };

    var link = link_object.getAttribute('href');
    var text = TEXT_NOT_HIDDEN;

    var span = document.createElement('span');
    span.className = META_BLOCK_SELECTOR;

    var a  = document.createElement('a');
    a.className = META_BLOCK_LINK_SELECTOR + ' ' + _ST.key + '_span';
    a.innerText = text;

    a.addEventListener('click', function(){
        _ST.set(object.hash);
        object.element.remove();
    });

    span.appendChild(a);

    return span;

};


function VideoContainer(element) {
    this.element = element;
    this.hash = null;
    this.is_manipulated = function(element) {
        var self = this;
        return element.querySelectorAll('.' + _ST.key + '_span').length > 0;
    };
    this.add_link = function(element) {
        var self = this;
        var link_target = element.querySelector('#metadata-line');
        if (link_target !== null){
            var siblings = link_target.querySelectorAll('span');
            var sibling = siblings[siblings.length-1];
            insert_after(get_template(self), sibling);
        };
    };
    this.set_hash = function(element) {
        var self = this;
        var object = element.querySelector('#thumbnail');
        if (object !== null) {
            self.hash = object.getAttribute('href');
        };
    };
    this.init = function(element) {
        self = this;
        if (self.is_manipulated(element) === false) {
            self.add_link(element);
            self.set_hash(element);
        };
    };
    this.init(this.element);
};


function iterate(array){

    // Iterate video object array
    for (var i = 0; i < array.length; i++) {

        // Create container object
        object = new VideoContainer(array[i]);

        // Container hasnt been manipulated already
        if (object.hash !== null) {

            // If container is in storage as hidden, remove from DOM
            if (_ST.is_set(object.hash) === true) { array[i].remove() };

        } else {

            delete object;

        };

    };
};


function detect_video_containers() {

    // Subscriptions
    // var array_1 = document.querySelectorAll('ytd-item-section-renderer');
    // iterate(array_1);

    // Homepage list
    // var array_2 = document.querySelectorAll('ytd-rich-item-renderer');
    // iterate(array_2);

    // Sidebar list
    var array_3 = document.querySelectorAll('ytd-compact-video-renderer');
    iterate(array_3);

};


chrome.storage.sync.get(_ST.keys, function(result) {
    _ST.data = result[_ST.key];
    if (_ST.data === undefined) { _ST.data = [] };

    detect_video_containers();

    window.addEventListener('scroll', function() {
        detect_video_containers();
    });

});
