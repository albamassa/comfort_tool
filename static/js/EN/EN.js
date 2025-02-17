keys = ["ta", "tr", "vel", "rh", "met", "clo", "trm"];

$(document).ready(function () {

    // highlight navigation bar button
    $('a.active').removeClass('active');
    $('#nav_a_en').addClass('active');

    var cloSelect = document.getElementById('cloSelect');
    cloSelect.onchange = function () {
        document.getElementById('clo').value = cloSelect.value;
        update();
    };
    cloInsulationTypicalEnsambles.forEach(function (element) {
        cloSelect.options.add(new Option(element.clothing, element.clo));
    });
    var cloMultiSelect = document.getElementById('cloMultiSelect');
    cloInsulationGarments.forEach(function (element) {
        cloMultiSelect.options.add(new Option(element.article, element.clo));
    });
    var actSelect = document.getElementById('actSelect');
    actSelect.onchange = function () {
        document.getElementById('met').value = actSelect.value;
        update();
    };
    metRatesTypicalTasks.forEach(function (element) {
        actSelect.options.add(new Option(element.activity, element.met));
    });

    $(function () {
        $(".multiselect").multiselect({
            sortable: false,
            searchable: false,
            dividerLocation: 0.5
        });
    });
    $('#adaptive-inputs, #adaptive-note, #psychtop-note, #temphum-note, #chart-div-adaptive, #temphumchart-div').hide();
    window.isCelsius = true;
    window.humUnit = 'rh';
    setDefaults();
    update();
    bc.drawChart();
    var bound = bc.findComfortBoundary(d, 0.5);
    enbc.drawComfortRegions(d);
    bc.drawPoint();

    pc.drawChart();
    var json = [{
        "db": d.ta,
        "hr": pc.getHumRatio(d.ta, d.rh)
    }];
    enpc.drawComfortRegions(d);
    pc.drawPoint(json);

    ac.drawChart();
    ac.drawPoint([d]);
});

$(function () {

    $('#globedialog').dialog({
        autoOpen: false,
        height: 350,
        width: 400,
        modal: true,
        resizable: false,
        buttons: {
            "Set mean radiant temperature": function () {
                var tr = parseFloat($('#mrt-result').val());
                if (!isCelsius) tr = util.CtoF(tr);
                $('#tr').val(tr);
                $(this).dialog("close");
                update();
            }
        }
    });

    $('#localdialog').dialog({
        autoOpen: false,
        height: 600,
        width: 470,
        modal: true,
        resizable: false,
    });

    $('#link').click(function () {
        if ($('#tr-input').is(':hidden')) {
            $('#ta-lab').html('<a class="mainlink" href="http://en.wikipedia.org/wiki/Dry-bulb_temperature" target="_new">Air temperature</a>');
            $('#globeTemp').removeAttr('disabled');
            $('#tr-input, #tr-lab').show();
        } else {
            $('#ta-lab').html('<a class="mainlink" href="http://en.wikipedia.org/wiki/Operative_temperature" target="_new">Operative temperature</a>');
            $('#globeTemp').attr('disabled', 'disabled');
            $('#tr-input, #tr-lab').hide();
        }
    });

    $('#radio').buttonset();

    $('#customClo').click(function () {
        $('#customCloToggle').toggle('fast');
    });

    $('button').button();

    $('.buttons').buttonset();

    // create spinners and impose limits based on value defined in envValLimits
    $('#ta').spinner({
        step: envVarLimits.ta.si.step,
        min: envVarLimits.ta.si.min,
        max: envVarLimits.ta.si.max,
        numberFormat: "n"
    });

    $('#tr').spinner({
        step: envVarLimits.tr.si.step,
        min: envVarLimits.tr.si.min,
        max: envVarLimits.tr.si.max,
        numberFormat: "n"
    });

    $('#trm').spinner({
        step: envVarLimits.trm.si.step,
        min: envVarLimits.trm.si.min,
        max: envVarLimits.trm.si.max,
        numberFormat: "n"
    });

    $('#vel, #vel_a').spinner({
        step: envVarLimits.vel.si.step,
        min: envVarLimits.vel.si.min,
        max: envVarLimits.vel.si.max,
        numberFormat: "n"
    });

    $('#clo').spinner({
        step: envVarLimits.clo.step,
        min: envVarLimits.clo.min,
        max: envVarLimits.clo.max,
        numberFormat: "n"
    });

    $('#met').spinner({
        step: envVarLimits.met.step,
        min: envVarLimits.met.min,
        max: envVarLimits.met.max,
        numberFormat: "n"
    });

    $('#rh').spinner({
        step: envVarLimits.rh.step,
        min: envVarLimits.rh.min,
        max: envVarLimits.rh.max,
        numberFormat: "n"
    });

});

$('#humidity-spec').change(function () {
    change_humidity_selection();
});

$('#link').click(function () {
    $('#tr').val($('#ta').val());
});

$('.inputbox').keydown(function (event) {
    if (event.keyCode === 13) {
        var inputs = $('.inputbox:visible:enabled');
        var nextBox = inputs.index(this) + 1;
        if (nextBox === inputs.length) nextBox = 0;
        inputs[nextBox].focus();
    }
});

$('.in').click(function () {
    update();
});

$('.inputbox').focusout(function () {
    update();
});

$('#vel_a').focusout(function () {
    update();
});

$('#vel-a-box').click(function () {
    update();
});

$('#unitsToggle').click(function () {
    toggleUnits();
    update();
});

$('#setDefaults').click(function () {
    setDefaults();
    update();
});

$('#specPressure').click(function () {
    var customPressure = prompt('Enter atmospheric pressure in '.concat(isCelsius ? 'Pascals (Pa) default value 101325 Pa' : 'inches of mercury (inHg)'));
    if (customPressure !== '' && customPressure !== null) {
        customPressure = parseFloat(customPressure);
        if (!isCelsius) {
            customPressure *= 3386.39;
        }
        if (!isNaN(customPressure) && customPressure >= 30000 && customPressure <= 110000) {
            psy.PROP.Patm = customPressure;
            enpc.redraw_rh_lines();
            update();
        } else {
            window.alert('The entered atmospheric pressure is invalid.');
        }
    }
});

$('#globeTemp').click(function () {
    var container = $('#globedialog');
    $.ajax({
        url: util.STATIC_URL + '/html/globetemp.html',
        success: function (data) {
            $('#globedialog').html(data);
            if (!isCelsius) {
                $('#ta-g').val('77');
                $('#vel-g').val('20');
                $('#tglobe').val('77');
                $('#diameter').val('6');
                $('#g-ta-unit').html(' &deg;F');
                $('#g-vel-unit').html(' fpm');
                $('#g-tglobe-unit').html(' &deg;F');
                $('#g-globediam-unit').html(' in');
                $('#g-mrt-unit').html(' &deg;F')
            }
        },
        async: false
    });
    container.dialog("open");
    updateGlobe();
    $('.input-dialog').focusout(function () {
        updateGlobe();
    });
});

$('#localDisc').click(function () {
    var container = $('#localdialog');
    $.ajax({
        url: util.STATIC_URL + '/html/localdisc.html',
        success: function (data) {
            $('#localdialog').html(data);
            if (!isCelsius) {
                $('.tempunit').html(' &deg;F');
                $('.velunit').html(' fpm');
                $('#T_head').val('77');
                $('#T_ankle').val('77');
                $('#T_floor').val('77');
                $('#T_op').val('77');
                $('#local_vel').val('20')
            }
        },
        async: false
    });
    container.dialog("open");
    $('.input-dialog-local').focusout(function () {
        updateLocalDisc();
    });
});

$('#setClo').click(function () {
    setClo();
    update();
});

$('#addToEnsembles').click(function () {
    addToEnsembles();
});

$('#model-type').change(function () {
    $('#pmv-out-label').html('PMV');
    $('#localDisc').removeAttr('disabled');
    model = $('#model-type').val();
    if (model === 'pmv') {
        $('#pmv-inputs, #pmv-outputs, #cloInput, #actInput, #humidity-spec-cont, #chart-div, #chartSelect-cont, #pmv-notes').show();
        $('#adaptive-note, #adaptive-inputs, #adaptive-outputs, #chart-div-adaptive, #chart-title-adaptive, #temphumchart-div, #temphumchart-title').hide();
    } else if (model === 'adaptiveComfort') {
        $('#pmv-inputs, #pmv-outputs, #cloInput').hide();
        $('#actInput, #humidity-spec-cont, #chart-div, #temphumchart-div, #pmv-notes, #chartSelect-cont').hide();
        $('#adaptive-note, #adaptive-inputs, #adaptive-outputs, #chart-div-adaptive, #chart-title-adaptive').show();
        $('#localDisc').attr('disabled', 'disabled');
    }
    update();
});

/* Code used to select which fields to be displayed when the user selct the method: adaptive or PMV */
$("#chartSelect").change(function () {
    const chart = $("#chartSelect").val();

    // PMV method selection
    if (chart === "psychta" || chart === "psychtop") {
        $("#chart-div").show();
        $("#temphumchart-div").hide();

        // Selction to use air temperature as well as mean radiant temperature
        if (chart === "psychta") {
            $("#psychta-note").show();
            $("#psychtop-note, #temphum-note").hide();

            $("#db-axis-C-label").text("Dry-bulb Temperature [°C]");
            $("#db-axis-F-label").text("Dry-bulb Temperature [°F]");

            if ($('#link').is(':checked')) {
                $('#labelforlink').show();
            } else {
                $('#ta-lab').html('<a class="mainlink" href="http://en.wikipedia.org/wiki/Dry-bulb_temperature" target="_new">Air temperature</a>');
                $('#globeTemp').removeAttr('disabled');
                $('#tr-input, #tr-lab, #labelforlink').show();
            }

            // Selction to use air operative temperature
        } else if (chart === "psychtop") {
            $("#psychtop-note").show();
            $("#psychta-note, #temphum-note").hide();

            $("#db-axis-C-label").text("Operative Temperature [°C]");
            $("#db-axis-F-label").text("Operative Temperature [°F]");

            $('#ta-lab').html('<a class="mainlink" href="http://en.wikipedia.org/wiki/Operative_temperature" target="_new">Operative temperature</a>');
            $('#globeTemp').attr('disabled', 'disabled');
            $('#tr-input, #tr-lab, #labelforlink').hide();
        }

        // selection Adaptive method
    } else if (chart === "temphum") {
        $("#temphumchart-div, #temphum-note").show();
        $("#chart-div, #psychta-note, #psychtop-note").hide();
        if ($('#link').is(':checked')) {
            $('#labelforlink').show();
        } else {
            $('#ta-lab').html('<a class="mainlink" href="http://en.wikipedia.org/wiki/Dry-bulb_temperature" target="_new">Air temperature</a>');
            $('#globeTemp').removeAttr('disabled');
            $('#tr-input, #tr-lab, #labelforlink').show();
        }
    }
    update();
});

function update() {

    let r;

    if ($('#link').is(':checked') || $("#chartSelect").val() === "psychtop") {
        $('#tr').val($('#ta').val());
    }

    // get user input and validate that complies with standard applicability limits
    validateUserEntry('');

    d.wme = 0;
    if (!isCelsius) {
        d.ta = util.FtoC(d.ta);
        d.tr = util.FtoC(d.tr);
        d.trm = util.FtoC(d.trm);
        d.vel /= 196.9;
        d.vel_a /= 196.9;
        if (window.humUnit === 'wetbulb' || window.humUnit === 'dewpoint') d.rh = util.FtoC(d.rh);
        else if (window.humUnit === 'vappress') d.rh *= 2953;
    } else {
        if (window.humUnit === 'vappress') d.rh *= 1000;
    }
    d.rh = psy.convert(d.rh, d.ta, window.humUnit, 'rh');
    model = document.getElementById('model-type').value;
    if (model === 'pmv') {
        r = comf.pmv(d.ta, d.tr, d.vel, d.rh, d.met, d.clo, 0);
        if (isNaN(r.pmv)) {
            window.alert('The combination of input parameters you selected lead to an incorrect calculation of the PMV index\n' +
                'Please check that the value you entered are correct.\n' +
                'The input parameters has been set back to their default values.');
            setDefaults();
        }
        renderPmvResults(r);
        calcPmvCompliance(d, r);
        if ($('#chart-div').is(':visible')) {
            enpc.redrawComfortRegions(d);
            var pointdata = [{
                "db": d.ta,
                "hr": pc.getHumRatio(d.ta, d.rh)
            }];
            pc.redrawPoint(pointdata);
        } else if ($('#temphumchart-div').is(':visible')) {
            enbc.redrawComfortRegions(d);
            bc.redrawPoint();
        }

    } else if (model === 'adaptiveComfort') {
        r = comf.adaptiveComfortEN15251(d.ta, d.tr, d.trm, d.vel_a);
        renderAdaptiveResults(r);
        calcAdaptiveCompliance(d, r);
        ac.redrawPoint([d])
    }
}

function getCategory(pmv) {
    if (Math.abs(pmv) <= 0.2) return 'I';
    else if (Math.abs(pmv) <= 0.5) return 'II';
    else if (Math.abs(pmv) <= 0.7) return 'III';
    else if (Math.abs(pmv) > 0.7) return 'IV';
    else return '-';
}

function renderPmvResults(r) {
    $('#pmv-res').html(r.pmv.toFixed(2));
    $('#ppd-res').html(r.ppd.toFixed(0));
    var category = getCategory(r.pmv);
    $('#category').html(category);
}

function renderAdaptiveResults(r) {
    const to = (parseFloat($('#ta').val()) + parseFloat($('#tr').val())) / 2;
    if (!isCelsius) {
        r.tComfIUpper = util.CtoF(r.tComfIUpper);
        r.tComfIIUpper = util.CtoF(r.tComfIIUpper);
        r.tComfIIIUpper = util.CtoF(r.tComfIIIUpper);
        r.tComfILower = util.CtoF(r.tComfILower);
        r.tComfIILower = util.CtoF(r.tComfIILower);
        r.tComfIIILower = util.CtoF(r.tComfIIILower);
    }
    $('#limitsI').html('Operative temperature: ' + r.tComfILower.toFixed(1) + ' to ' + r.tComfIUpper.toFixed(1));
    $('#limitsII').html('Operative temperature: ' + r.tComfIILower.toFixed(1) + ' to ' + r.tComfIIUpper.toFixed(1));
    $('#limitsIII').html('Operative temperature: ' + r.tComfIIILower.toFixed(1) + ' to ' + r.tComfIIIUpper.toFixed(1));
    if (r.acceptabilityI) {
        $('#sensationIII, #sensationII, #sensationI').html('Comfortable');
    } else if (r.acceptabilityII) {
        $('#sensationIII, #sensationII').html('Comfortable');
        if (to < r.tComfIUpper) {
            $('#sensationI').html('<span style="color:blue;">Too cool</span>');
        } else {
            $('#sensationI').html('<span style="color:red;">Too warm</span>');
        }
    } else if (r.acceptabilityIII) {
        $('#sensationIII').html('Comfortable');
        if (to < r.tComfIIUpper) {
            $('#sensationI, #sensationII').html('<span style="color:blue;">Too cool</span>');
        } else {
            $('#sensationI, #sensationII').html('<span style="color:red;">Too warm</span>');
        }
    } else if (to < r.tComfIIIUpper) {
        $('#sensationIII, #sensationII, #sensationI').html('<span style="color:blue;">Too cool</span>');
    } else {
        $('#sensationIII, #sensationII, #sensationI').html('<span style="color:red;">Too warm</span>');
    }
}

function calcPmvCompliance(d, r) {
    var pmv_complyI = Math.abs(r.pmv) <= 0.2;
    var pmv_complyII = Math.abs(r.pmv) <= 0.5;
    var pmv_complyIII = Math.abs(r.pmv) <= 0.7;
    var met_comply = d.met <= 4 && d.met >= 0.8;
    var clo_comply = d.clo <= 2;

    var special_msg = '';
    comply = true;

    if (!met_comply) {
        comply = false;
        special_msg += 'Metabolic rates below 0.8 or above 4.0 are not covered by this standard<br>';
    }
    if (!clo_comply) {
        comply = false;
        special_msg += 'Clo values above 2.0 are not covered by this standard<br>';
    }
    if (!pmv_complyIII) {
        comply = false;
    }

    renderCompliance(comply, special_msg);
}

function calcAdaptiveCompliance(d, r) {
    var comply = true;
    var special_msg = '';

    if (d.trm > 30 || d.trm < 10) {
        comply = false;
        special_msg += '&#8627; Running mean outdoor temperatures above ' + (isCelsius ? '30&deg;C ' : '92.3&deg;F ')
            + 'or below ' + (isCelsius ? '10&deg;C ' : '50&deg;F ') + 'are not covered by Standard-55<br>';
    }
    if (!r.acceptabilityIII) comply = false;

    renderCompliance(comply, special_msg);
}

function renderCompliance(comply, special_msg) {
    const comply_msg = '&#10004; &nbsp;Complies with EN-15251';
    const no_comply_msg = '&#10008 &nbsp; Does not comply with EN-15251';

    $('#vel-range').html('');
    if (comply) {
        $('#comply-msg').html(comply_msg);
        $('#output-b').removeClass("alert alert-danger").addClass("alert alert-success").css({'color': 'green'});
        ;
        $('#special-msg').html(special_msg);
    } else {
        $('#comply-msg').html(no_comply_msg);
        $('#output-b').removeClass("alert alert-success").addClass("alert alert-danger").css({'color': 'red'});
        ;
        $('#special-msg').html(special_msg);
    }
}

function setDefaults() {
    if (!isCelsius) toggleUnits();
    var hs = $('#humidity-spec').val();
    var rh = psy.convert(50, 25, 'rh', hs);
    if (hs === 'vappress') {
        rh /= 1000;
    }
    var defaults = {
        ta: 25,
        tr: 25,
        vel: 0.10,
        rh: rh.toFixed(psy.PREC[hs]),
        met: 1.1,
        clo: 0.5,
        trm: 24,
        vel_a: 0.2
    };

    keys.forEach(function (element) {
        document.getElementById(element).value = defaults[element];
    });
}

// Set clo value created by the custom ensemble dialog
function setClo() {
    let clo = 0;
    var opt = document.getElementById('cloMultiSelect').options;
    for (var i = 0; i < opt.length; i++) {
        if (opt[i].selected) clo += parseFloat(opt[i].value);
    }
    document.getElementById('clo').value = clo.toFixed(2);
}

// Add selected clothing items to create a custom ensemble
function addToEnsembles() {
    var items = [];
    var ensembleClo = 0;
    var opt = document.getElementById('cloMultiSelect').options;
    for (var i = 0; i < opt.length; i++) {
        if (opt[i].selected) {
            items.push(opt[i].text);
            ensembleClo += parseFloat(opt[i].value);
        }
    }
    cloSelect.options.add(new Option(items.join(', '), ensembleClo.toFixed(2)));
}

function updateGlobe() {
    let ta = parseFloat($('#ta-g').val());
    let vel = parseFloat($('#vel-g').val());
    let tglobe = parseFloat($('#tglobe').val());
    let diameter = parseFloat($('#diameter').val());
    let emissivity = parseFloat($('#emissivity').val());
    if (!isCelsius) {
        ta = util.FtoC(ta);
        vel /= 196.9;
        tglobe = util.FtoC(tglobe);
        diameter *= 0.0254
    }
    let tr = psy.globetemp(ta, vel, tglobe, diameter, emissivity);
    if (!isCelsius) tr = util.CtoF(tr);
    $('#mrt-result').val(tr.toFixed(1));
}