// Default/example template
let exampleTemp = { name: 'Example Template', metrics: [
  { name: 'Toggle Metric', type: 'toggle', newline: 'Group' },
  { name: 'Number Metric', type: 'number', max: 10 },
  { name: 'Select Metric', type: 'select', values: ['Value 1', 'Value 2', 'Value 3'] },
  { name: 'Text Metric', type: 'text', tip: 'Custom tip' },
  { name: 'Rating Metric', type: 'rating' },
]};
let templates = [];
let gameMetrics = [];
let currentTemp;
let isCustomTemp = false;

if (localStorage.getItem('templates')) {
  templates = JSON.parse(localStorage.getItem('templates'));
}

// Populate template picker with template options, select previously selected template
$('#opt-temp').append(new Option(exampleTemp.name, exampleTemp.name));
$.each(templates, (i, template) => {
  $('#opt-temp').prepend(new Option(template.name, template.name));
  if (template.selected) {
    currentTemp = template;
    isCustomTemp = true;
    loadTemplate(template.metrics);
    $('#opt-temp').val(currentTemp.name);
    $('#nav-temp').html(currentTemp.name);
  }
});
if (!isCustomTemp) {
  currentTemp = exampleTemp;
  loadTemplate(exampleTemp.metrics);
  $('#opt-temp').val(currentTemp.name);
  $('#nav-temp').html(currentTemp.name);
}
localStorage.setItem('templates', JSON.stringify(templates));

// Change to selected template
function setTemplate() {
  if (localStorage.getItem('surveys')) download(false);
  isCustomTemp = false;
  $.each(templates, (i, template) => {
    template.selected = false;
    if ($('#opt-temp').val() == template.name) {
      currentTemp = template;
      isCustomTemp = true;
      template.selected = true;
      loadTemplate(template.metrics);
      setLoc(loc);
      $('#nav-temp').html(currentTemp.name);
    }
  });
  if (!isCustomTemp) {
    currentTemp = exampleTemp;
    loadTemplate(exampleTemp.metrics);
    $('#opt-temp').val(currentTemp.name);
    $('#nav-temp').html(currentTemp.name);
    setLoc(loc);
  }
  localStorage.setItem('templates', JSON.stringify(templates));
}
$('#opt-temp').change(() => {
  setTemplate();
});

$('#opt-temp-copy').click(() => {
  let input = $('<input>');
  let tempToCopy = currentTemp;
  delete tempToCopy['selected'];
  $('body').append(input);
  input.attr('value', JSON.stringify(tempToCopy));
  input.select();
  document.execCommand('copy');
  $(input).remove();
  alert(`Copied ${currentTemp.name}`);
});

// Create and select new template from JSON text
$('#opt-temp-add').click(() => {
  let newTempPrompt = prompt('Type/paste new template:');
  if (newTempPrompt) {
    let newTemp = JSON.parse(newTempPrompt);
    if (newTemp instanceof Array) newTemp = newTemp[0];
    newTemp.selected = true;

    let error = false;
    if (newTemp.name == exampleTemp.name) error = "Template has same name as example";
    if (newTemp.name && newTemp.metrics) {
      $.each(newTemp.metrics, (_i, metric) => {
        if (!metric.name) error = "Metric has no name";
        else if (metric.type == 'number' && metric.max < 1) error = "Max is less than one";
        else if (metric.type == 'select' && !metric.values) error = "Metric has no values";
        else if (!['toggle', 'number', 'select', 'text', 'rating'].includes(metric.type)) error = "Unknown metric type";
      });
    } else error = "Template is invalid";
    if (error) {
      alert(`Could not add template! Error: ${error}`);
      return;
    }
    
    $.each(templates, (_i, template) => {
      if (newTemp.name == template.name) {
        if (confirm(`${newTemp.name} already exists. Replace current template?`)) {
          $.each(templates, (i, template) => {
            if (template.name == currentTemp.name) {
              templates.splice(i, 1);
              return false;
            }
          });
          $('#opt-temp option:checked').remove();
          setTemplate();
          localStorage.setItem('templates', JSON.stringify(templates));
        } else {
          return false;
        }
      };
    });

    templates.unshift(newTemp);
    $('#opt-temp').prepend(new Option(newTemp.name, newTemp.name));
    $('#opt-temp').val(newTemp.name);
    setTemplate();
  }
});

$('#opt-temp-remove').click(() => {
  if (!isCustomTemp) { alert('The example template cannot be removed.'); return; }
  if (prompt(`Are you sure? Type '${currentTemp.name}' to remove the template`)) {
    $.each(templates, (i, template) => {
      if (template.name == currentTemp.name) {
        templates.splice(i, 1);
        return false;
      }
    });
    $('#opt-temp option:checked').remove();
    setTemplate();
    localStorage.setItem('templates', JSON.stringify(templates));
  }
});

// Handles metric UI/value changes
function toggle(i) {
  gameMetrics[i].element.find('i').toggleClass('far fa-square fas fa-check-square');
  gameMetrics[i].value = !gameMetrics[i].value;
}
function crement(i, way) {
  if (way == 'inc' && gameMetrics[i].value < gameMetrics[i].max) gameMetrics[i].value++;
  else if (way == 'dec' && gameMetrics[i].value > 0) gameMetrics[i].value--;
  gameMetrics[i].element.children('.inc').html(gameMetrics[i].value);
}
function changeSelect(i) {
  gameMetrics[i].value = gameMetrics[i].element.find('option:checked').html();
}
function changeText(i) {
  gameMetrics[i].value = gameMetrics[i].element.children('input').val().replace(';', ' ');
}
function changeRating(i, val) {
  gameMetrics[i].element.find('.star').html('<i class="far fa-star"></i>');
  if (val == 0 && gameMetrics[i].value == 1) {
    gameMetrics[i].value = 0;
    return;
  } else {
    gameMetrics[i].value = val + 1;
    for (let count = 0; count <= val + 1; count++) {
      gameMetrics[i].element.find(`div>.star:nth-child(${count})`).html('<i class="fas fa-star"></i>');
    }
  }
}

// Create scouting metrics (UI and state variables) from template
function loadTemplate(t) {
  $('#metrics').empty();
  gameMetrics = [];
  let metricObj, newMetric, prevDiv, newDiv;
  prevDiv = $('<div></div>');
  prevDiv.addClass('container');
  $.each(t, (i, metric) => {
    metricObj = { name: metric.name };
    if (metric.type == 'toggle') {
      newMetric = $('<div></div>');
      
      let button = $('<button></button>');
      button.addClass('button mobile border-bottom round ripple');
      button.append('<i class="far fa-square"></i>', ` ${metric.name}`);
      button.click(() => toggle(i));
      newMetric.append(button);
      metricObj.value = false;
    
    } else if (metric.type == 'number') {
      newMetric = $('<div></div>');
      newMetric.append(metric.name, '<br>');
      
      let decBtn = $('<button></button>');
      decBtn.addClass('dec button border-bottom round ripple');
      decBtn.click(() => crement(i, 'dec'));
      decBtn.append('−');
      let incBtn = $('<button></button>');
      incBtn.addClass('inc button border-bottom round ripple');
      incBtn.css('width', '80px');
      incBtn.click(() => crement(i, 'inc'));
      incBtn.append('0');
      
      newMetric.append(decBtn, ' ', incBtn);
      metricObj.max = metric.max || 100;
      metricObj.value = 0;
    
    } else if (metric.type == 'select') {
      newMetric = $('<label></label>');
      newMetric.append(metric.name, '<br>');
      
      let select = $('<select></select>');
      select.addClass('select round black');
      select.on('change', () => changeSelect(i));
      $.each(metric.values, (index, selValue) => {
        let newSel = $('<option></option>');
        newSel.attr('value', index);
        newSel.html(selValue);
        select.append(newSel);
      });
      newMetric.append(select);
      metricObj.value = metric.values[0];

    } else if (metric.type == 'text') {
      newMetric = $('<label></label>');
      newMetric.append(metric.name, '<br>');
      if (metric.length == 'long') newMetric.css('width', '100%');
      let input = $('<input>');
      input.addClass('input round black');
      input.attr('placeholder', metric.tip ? metric.tip : metric.name);
      input.on('input', () => changeText(i));
      newMetric.append(input);
      metricObj.value = '';
    
    } else if (metric.type == 'rating') {
      newMetric = $('<div></div>');
      newMetric.append(metric.name, '<br>');
      
      let ratingBar = $('<div></div>');
      ratingBar.addClass('round border-bottom');
      ratingBar.css('width', 'fit-content');
      for (let count = 0; count < 5; count++) {
        let star = $('<button></button>');
        star.addClass('star button ripple');
        star.append('<i class="far fa-star"></i>');
        star.click(() => changeRating(i, count));
        ratingBar.append(star);
      }
      newMetric.append(ratingBar);
      metricObj.value = 0;
    }
    newMetric.addClass('show-inline-block margin-left margin-bottom');

    if (metric.newline) {
      newDiv = $('<div></div>');
      newDiv.addClass('container');
      if (metric.newline !== true) newDiv.append(metric.newline, '<br>');
      newDiv.append(newMetric);
      $('#metrics').append(prevDiv);
      prevDiv = newDiv;
    } else {
      prevDiv.append(newMetric);
    }

    metricObj.element = newMetric;
    metricObj.type = metric.type;
    gameMetrics.push(metricObj);
  });
  $('#metrics').append(prevDiv);
}
