// This file is basically copy/pasted from prod, we're just putting it in its
// own js file instead of right in the template
jQuery(function($) {
  // custom publicator modal code
  if (window.innerWidth < 991) {
    // don't use modals for anything that would be too small
    $("a[data-toggle='modal']").attr("target", "_blank").on("click", function (ev) {
      ev.stopPropagation();
    })
  } else {
    var $myViewerContent = $("#myViewerContent"),
        $publicatorModalLabel = $("#publicatorModalLabel");

    $('#publicatorModal').on('shown.bs.modal', function (ev) {
      var $button = $(ev.relatedTarget),
          publicatorid = $button.data("publicatorid"),
          modalTitle = $button.data("title"),
          viewer = new com.zmags.api.Viewer();
      $publicatorModalLabel.html(modalTitle);
      $myViewerContent.html("");
      viewer.setPublicationID(publicatorid);
      viewer.setParentElementID("myViewerContent");
      viewer.show();
    }).on("hide.bs.modal", function (ev) {
      $publicatorModalLabel.html("");
      $myViewerContent.html("");
    });
  }
});
