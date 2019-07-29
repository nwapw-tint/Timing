function save_options() {
    sites = document.getElementById('sites').value;
    chrome.storage.sync.set({sites:sites}, function() {reassureUser()});
  }

  function restore_options() {
    chrome.storage.sync.get({sites:""}, function(items) {
      document.getElementById('sites').value = items.sites;
    });
  }

document.addEventListener('DOMContentLoaded', restore_options());
document.getElementById('sites').addEventListener("blur", function(event){console.log("saving");save_options()});

function reassureUser()
{
var status = document.getElementById('status');
status.textContent = 'Just saved.';
setTimeout(function() {
  status.textContent = ''
}, 750);
}