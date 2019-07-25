function save_options() {
    var sites = document.getElementById('sites').value;
    chrome.storage.sync.set({
      sites:sites
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }

  function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
      sites: "none"
    }, function(items) {
      alert(items.sites);
    });
  }
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',save_options);//triggers save_options() when save button clicked