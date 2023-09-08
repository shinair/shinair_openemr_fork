/*
 * vitals_functions.js
 * @package openemr
 * @link      http://www.open-emr.org
 * @author    Stephen Nielson <stephen@nielson.org>
 * @copyright Copyright (c) 2021 Stephen Nielson <stephen@nielson.org>
 * @license   https://github.com/openemr/openemr/blob/master/LICENSE GNU General Public License 3
 */

(function (window, oeUI) {

    let translations = {};
    let webroot = null;

    function vitalsFormSubmitted() {
        var invalid = "";

        document.getElementById('height_input').classList.remove('error');
        // 0 < height < 108 (inches) constraint implementation
        if (document.getElementById('height_input').value != "") {
            if (document.getElementById('height_input').value <= 0 || document.getElementById('height_input').value > 108) {
                // Clear the value of height_input
                document.getElementById('height_input').value = "";
                invalid += vitalsTranslations['invalidHeight'] + ":" + vitalsTranslations['height_input'] + "\n";
                document.getElementById('height_input').className = document.getElementById('height_input').className + " error";
                document.getElementById('height_input').focus();
            }
        }

        // 0 < pulse < 350 (per min) constraint implementation
        document.getElementById('pulse_input').classList.remove('error');
        if (document.getElementById('pulse_input').value != "") {
            if (document.getElementById('pulse_input').value <= 0 || document.getElementById('pulse_input').value > 350) {
                // Clear the value of pulse_input
                document.getElementById('pulse_input').value = "";
                invalid += vitalsTranslations['invalidPulse'] + ":" + vitalsTranslations['pulse_input'] + "\n";
                document.getElementById('pulse_input').className = document.getElementById('pulse_input').className + " error";
                document.getElementById('pulse_input').focus();
                document.getElementById('pulse_input').value = "";
            }
        }

        // 0 < respiration < 100 (per min) constraint implementation
        document.getElementById('respiration_input').classList.remove('error');
        if (document.getElementById('respiration_input').value != "") {
            if (document.getElementById('respiration_input').value <= 2 || document.getElementById('respiration_input').value > 100) {
                invalid += vitalsTranslations['invalidRespiration'] + ":" + vitalsTranslations['respiration_input'] + "\n";
                document.getElementById('respiration_input').className = document.getElementById('respiration_input').className + " error";
                document.getElementById('respiration_input').focus();
                document.getElementById('respiration_input').value = "";
            }
        }

        // 0.4 < BMI < 600 constraint implementation (Based on the range values for height and weight)
        document.getElementById('BMI_input').classList.remove('error');
        if (document.getElementById('BMI_input').value != "") {
            if (document.getElementById('BMI_input').value <= 0.5 || document.getElementById('BMI_input').value > 601) {
                invalid += vitalsTranslations['invalidBMI'] + ":" + vitalsTranslations['BMI_input'] + "\n";
                document.getElementById('BMI_input').className = document.getElementById('BMI_input').className + " error";
                document.getElementById('BMI_input').focus();
                document.getElementById('BMI_input').value = "";
            }
        }

        // 40 < BPS < 400 constraint implementation
        document.getElementById('bps_input').classList.remove('error');
        if (document.getElementById('bps_input').value != "") {
            if (document.getElementById('bps_input').value <= 39 || document.getElementById('bps_input').value > 301) {
                invalid += vitalsTranslations['invalidBPS'] + ":" + vitalsTranslations['bps_input'] + "\n";
                document.getElementById('bps_input').className = document.getElementById('bps_input').className + " error";
                document.getElementById('bps_input').focus();
                document.getElementById('bps_input').value = "";
            }
        }

        // 0 < BPD < 300 constraint implementation
        document.getElementById('bpd_input').classList.remove('error');
        if (document.getElementById('bpd_input').value != "") {
            if (document.getElementById('bpd_input').value <= 30 || document.getElementById('bpd_input').value > 201) {
                invalid += vitalsTranslations['invalidBPD'] + ":" + vitalsTranslations['bpd_input'] + "\n";
                document.getElementById('bpd_input').className = document.getElementById('bpd_input').className + " error";
                document.getElementById('bpd_input').focus();
                document.getElementById('bpd_input').value = "";
            }
        }
        var elementsToValidate = ['weight_input', 'weight_input_metric', 'height_input', 'height_input_metric', 'bps_input', 'bpd_input', 'pulse_input', 'respiration_input', 'BMI_input', 'bps_input', 'bpd_input'];

        for (var i = 0; i < elementsToValidate.length; i++) {
            var current_elem_id = elementsToValidate[i];
            var tag_name = vitalsTranslations[current_elem_id] || "<unknown_tag_name>";

            document.getElementById(current_elem_id).classList.remove('error');

            if (isNaN(document.getElementById(current_elem_id).value)) {
                invalid += vitalsTranslations['invalidField'] + ":" + vitalsTranslations[current_elem_id] + "\n";
                document.getElementById(current_elem_id).className = document.getElementById(current_elem_id).className + " error";
                document.getElementById(current_elem_id).focus();
            }

            // 0 < weight < 999 constraint implementation
            if (current_elem_id == 'weight_input' && document.getElementById('weight_input').value != "" ) {
                if (document.getElementById(current_elem_id).value <= 4 || document.getElementById(current_elem_id).value > 800) {
                    invalid += vitalsTranslations['invalidWeight'] + ":" + vitalsTranslations[current_elem_id] + "\n";
                    document.getElementById(current_elem_id).className = document.getElementById(current_elem_id).className + " error";
                    document.getElementById(current_elem_id).focus();
                    document.getElementById('weight_input').value = "";
                }
            }

            if (invalid.length > 0) {
                invalid += "\n" + vitalsTranslations['validateFailed'];
                alert(invalid);
                return false;
            } else {
                return top.restoreSession();
            }
        }

        if (invalid.length > 0) {
            invalid += "\n" + vitalsTranslations['validateFailed'];
            alert(invalid);
            return false;
        } else {
            return top.restoreSession();
        }
    }

    function convInputElement(evt) {
        let node = evt.currentTarget;
        if (!node) {
            console.error("Missing node from event");
            return;
        }
        let system = node.dataset.system || "usa";
        let unit = node.dataset.unit || "";
        let targetSaveUnit = node.dataset.targetInput || "";
        let targetInputConv = node.dataset.targetInputConv || "";
        let precision = vitalsGetPrecision(node, 2);

        // we need to convert the value and store the original value in the hidden input field that we end up saving

        // we then need to show a two digit representation of the value
        let value = node.value;
        let inputSave = document.getElementById(targetSaveUnit);
        if (!inputSave) {
            console.error("Failed to find node with data-target-input of ", targetSaveUnit);
            return;
        }
        let inputConv = document.getElementById(targetInputConv);
        if (!inputConv) {
            console.error("Failed to find node with data-target-input-conv of ", targetInputConv);
            return;
        }

        if (value != "") {
            let convValue = convUnit(system, unit, value);
            if (!isNaN(convValue)) {
                inputConv.value = convValue.toFixed(precision);
                // all values are saved in usa system units
                if (system !== "usa") {
                    inputSave.value = inputSave.value = convValue;
                } else {
                    inputSave.value = value;
                }
            } else {
                console.error("Failed to get valid number for input with id ", node.id, " with value ", value);
            }
        } else {
            inputSave.value = "";
            inputConv.value = "";
        }

        if (targetSaveUnit == "weight_input" || targetSaveUnit == "height_input") {
            calculateBMI();
        }
    }

    function initDOMEvents() {
        let vitalsForm = document.getElementById('vitalsForm');
        if (!vitalsForm) {
            console.error("Failed to find vitalsForm DOM Node");
            return;
        }
        vitalsForm.addEventListener('submit', vitalsFormSubmitted);

        // we want to setup our reason code widgets
        if (oeUI.reasonCodeWidget) {
            oeUI.reasonCodeWidget.init(webroot);
        } else {
            console.error("Missing required dependency reason-code-widget");
            return;
        }

        let vitalsConvInputs = vitalsForm.querySelectorAll(".vitals-conv-unit");
        vitalsConvInputs.forEach(function (node) {
            node.addEventListener('change', convInputElement);
        });
    }
    function init(webRootParam, vitalsTranslations) {
        webroot = webRootParam;
        translations = vitalsTranslations;
        window.document.addEventListener("DOMContentLoaded", initDOMEvents);
    }

    let vitalsForm = {
        "init": init
    };
    window.vitalsForm = vitalsForm;
})(window, window.oeUI || {});

function vitalsGetPrecision(node, defaultValue) {
    defaultValue = defaultValue || 2;
    let precision = parseInt(node.dataset.precision || defaultValue);
    precision = !isNaN(precision) ? precision : defaultValue;
    return precision;
}

// TODO: we need to move all of these functions into the anonymous function and connect the events via event listeners
function convUnit(system, unit, value) {
    if (unit == 'kg' || unit == 'lbs') {
        if (system == 'metric') {
            return convKgtoLb(value);
        }
        else {
            return convLbtoKg(value);
        }
    }

    if (unit == 'in' || unit == 'cm') {
        if (system == 'metric') {
            return convCmtoIn(value);
        }
        else {
            return convIntoCm(value);
        }
    }

    if (unit == 'C' || unit == 'F') {
        if (system == 'metric') {
            return convCtoF(value);
        }
        else {
            return convFtoC(value);
        }
    }
}

function convLbtoKg(value) {
    var lb = value;
    var hash_loc = lb.indexOf("#");
    if (hash_loc >= 0) {
        var pounds = lb.substr(0, hash_loc);
        var ounces = lb.substr(hash_loc + 1);
        var num = parseInt(pounds) + parseInt(ounces) / 16;
        lb = num;
        return lb;
    }
    if (lb == "0") {
        return 0;
    }
    else if (lb == parseFloat(lb)) {
        kg = lb * 0.45359237;
        return kg;
    }
    else {
        return 0;
    }
}

function convKgtoLb(value) {
    var kg = value;

    if (kg == "0") {
        return 0;
    }
    else if (kg == parseFloat(kg)) {
        lb = kg / 0.45359237;
        return lb;
    }
    else {
        return 0;
    }
}

function convIntoCm(value) {
    var inch = value;

    if (inch == "0") {
        return 0;
    }
    else if (inch == parseFloat(inch)) {
        cm = inch * 2.54;
        return cm;
    }
    else {
        return 0;
    }
}

function convCmtoIn(value) {
    var cm = value

    if (cm == "0") {
        return 0;
    }
    else if (cm == parseFloat(cm)) {
        inch = cm / 2.54;
        return inch;
    }
    else {
        return 0;
    }
}

function convFtoC(value) {
    var Fdeg = value;
    if (Fdeg == "0") {
        return 0;
    }
    else if (Fdeg == parseFloat(Fdeg)) {
        let Cdeg = (Fdeg - 32) * 5 / 9; // originally 0.5556 which is not precise!
        return Cdeg;
    }
    else {
        return 0;
    }
}

function convCtoF(value) {
    var Cdeg = value;
    if (Cdeg == "0") {
        return 0;
    }
    else if (Cdeg == parseFloat(Cdeg)) {
        Cdeg = parseFloat(Cdeg);
        let Fdeg = (Cdeg * 9 / 5) + 32; // originally 0.5556 which is not precise when working with 2 digit decimal conversions!
        return Fdeg;
    }
    else {
        $("#" + name).val("");
    }
}

function calculateBMI() {
    var bmi = 0;
    let bmiNode = document.getElementById("BMI_input");
    if (!bmiNode) {
        console.error("Failed to find node with id BMI_input");
        return;
    }

    let precision = vitalsGetPrecision(bmiNode, 2);

    let heightNode = document.getElementById("height_input");
    if (!heightNode) {
        console.error("Failed to find node with id height_input");
        return;
    }
    let weightNode = document.getElementById("weight_input");
    if (!weightNode) {
        console.error("Failed to find node with id weight_input");
        return;
    }
    var height = parseFloat(heightNode.value);
    var weight = parseFloat(weightNode.value);
    if (isNaN(height) || height == 0 || isNaN(weight) || weight == 0) {
        bmiNode.value = "";
    }
    else if ((height == parseFloat(height)) && (weight == parseFloat(weight))) {
        bmi = weight / height / height * 703;
        bmi = bmi.toFixed(precision);
        bmiNode.value = bmi;
    }
    else {
        bmiNode.value = "";
    }
}