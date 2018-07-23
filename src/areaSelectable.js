(function($) {
  $.fn.areaSelectable = function(optionsOrMethod, args) {
    const $library = $(this);
    // Default settings
    const defaultSettings = {
      areaClass: $library.data("areaClass") || "area",
      color: $library.data("color") || "#cd0000",
      opacity: $library.data("opacity") || ".6",
      splitOperator: $library.data("splitOperator") || ",",
      x: $library.data("x") || "2",
      y: $library.data("y") || "3",
      width: $library.attr("width") || "auto",
      height: $library.attr("height") || "auto",
      createHidden: true,
      name: $library.data("name") || "",
      allowMultiple: $library.data("allowMultiple") || false,
      onAfterSelect: function(status, id) {},
      onBeforeSelect: function(status, id) {},
      onSelected: function(id) {},
      onDeselected: function(id) {}
    };
    const settings = $.extend(
      defaultSettings,
      typeof optionsOrMethod === "string" || optionsOrMethod instanceof String
        ? {}
        : optionsOrMethod
    );

    if (
      settings.width === "auto" ||
      settings.width === undefined ||
      settings.width === null
    ) {
      settings.width = $library.width();
    }

    if (
      settings.height === "auto" ||
      settings.height === undefined ||
      settings.height === null
    ) {
      settings.height = $library.height();
    }
    console.log(settings.height, settings.width);

    // Apply the selected styles.
    function setSelectableElementStyles(element) {
      element.css({
        "background-color": settings.color,
        opacity: settings.opacity
      });
    }
    // Apply the defaults settings
    function setUnselectableElementStyles(element) {
      element.css({
        "background-color": "transparent",
        opacity: "1"
      });
    }

    // Check options or Method, if string, then we accept as a method.
    if (
      typeof optionsOrMethod === "string" ||
      optionsOrMethod instanceof String
    ) {
      // Returns selected indexes
      if (optionsOrMethod === "getSelected") {
        return $library.data("selected");
      }

      // Set to selected given indexes
      if (optionsOrMethod === "setSelected") {
        const $parent = $(this).parent();
        const $input = $(this)
          .parent()
          .find("input:first");
        const selected = [$(this).data("selected")];
        let indexes = jQuery.isArray(args) ? args : [args];
        $parent.find(".area").each(function() {
          $area = $(this);
          if (indexes.indexOf($area.data("id")) > -1) {
            selected.push($area.data("id"));
            $area.data("selected", true);
            setSelectableElementStyles($area);
          }
        });
        $input.val(selected);
      }
    } else {
      // Apply every element.
      this.each(function() {
        const context = $(this);
        // Set css styles.
        context.css({
          width: settings.width,
          height: settings.height,
          position: "absolute"
        });
        // Wrap the element for absolute position.
        $(this).wrap(
          "<div style='margin:auto;width:" +
            settings.width +
            "px; height:" +
            settings.height +
            "px; " +
            "position: relative;'></div>"
        );
        const wrapper = context.parent();
        const name = settings.name
          ? settings.name
          : $library.attr("id")
            ? $library.attr("id")
            : $library.attr("name");
        const input = $('<input type="hidden" id="" name="' + name + '">');
        const partWidth = context.width() / settings.x;
        const partHeight = context.height() / settings.y;
        // Stores the Area Index
        let areaId = 0;
        // Create hidden input if can
        if (settings.createHidden) {
          wrapper.append(input);
        }
        // Create Array form selected areas
        let selectedAreas = context.data("selected") || [];
        // It's not an array.
        if (!jQuery.isArray(selectedAreas)) {
          // If it's separated with split operator.
          if (selectedAreas.toString().indexOf(settings.splitOperator) > -1) {
            selectedAreas = selectedAreas
              .toString()
              .split(settings.splitOperator);
          } else {
            selectedAreas = [selectedAreas.toString()];
          }
        }
        context.data("selected", selectedAreas);
        input.val(selectedAreas);
        for (let i = 0; i < settings.y; i++) {
          for (let j = 0; j < settings.x; j++) {
            areaId++;
            const top = partHeight * i;
            const left = partWidth * j;
            const area = $(
              '<div data-id="' +
                areaId +
                '" class="' +
                settings.areaClass +
                "" +
                '" style="position:absolute; left: ' +
                left +
                "px; top:" +
                top +
                "px; width: " +
                partWidth +
                "px; height: " +
                partHeight +
                'px;"></div>'
            );
            wrapper.append(area);
            // If area selected...
            if (jQuery.inArray(areaId.toString(), selectedAreas) !== -1) {
              // If doesn't support for multiple selection, and filled selectedAreas more than one.
              if (!settings.allowMultiple && selectedAreas.length > 0) {
                // Then make selected only first element of selectedAreas.
                if (selectedAreas[0] === areaId.toString()) {
                  area.data("selected", true);
                  setSelectableElementStyles(area);
                }
                continue;
              }
              // Make selected
              area.data("selected", true);
              setSelectableElementStyles(area);
            }
          }
        }
        // Hover, leave, click functionality.
        wrapper
          .find("." + settings.areaClass)
          .mousemove(function() {
            if (
              $(this).data("selected") === false ||
              $(this).data("selected") === undefined
            ) {
              setSelectableElementStyles($(this));
              $(this).css("cursor", "pointer");
            }
          })
          .mouseleave(function() {
            if (
              $(this).data("selected") === false ||
              $(this).data("selected") === undefined
            ) {
              setUnselectableElementStyles($(this));
              $(this).css("cursor", "pointer");
            }
          })
          .click(function() {
            const $me = $(this);
            const areaId = $me.data("id");
            settings.onBeforeSelect($me.data("selected"), areaId);
            // If Already selected make unselected else make selected.
            if ($me.data("selected") === true) {
              // make unselected
              $me.data("selected", false);
              // Search for index then remove it from array.
              const index = selectedAreas.indexOf($me.data("id").toString());
              if (index > -1) {
                selectedAreas.splice(index, 1);
              }
              // Set for the defaults.
              setUnselectableElementStyles($me);
              // Call the deselected method
              settings.onDeselected(areaId);
            } else {
              // If does not allow multiple selection and already selected an area
              // Then not do anything just leave onClick action.
              if (!settings.allowMultiple && selectedAreas.length === 1) {
                // This called, because breaking onCLick action at here.
                settings.onAfterSelect($me.data("selected"), areaId);
                return;
              }
              $me.data("selected", true);
              if (selectedAreas.indexOf($me.data("id")) === -1) {
                selectedAreas.push($me.data("id").toString());
              }
              setSelectableElementStyles($me);
              // Call the selected method
              settings.onSelected(areaId);
            }
            console.log(selectedAreas);
            // Set new Values
            input.val(selectedAreas);
            // At the last, call after select method
            settings.onAfterSelect($me.data("selected"), areaId);
          });
      });
      return this;
    }
  };
})(jQuery);
