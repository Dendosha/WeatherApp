const API_KEY = '57a9686eda6f4fa3ae2124524240704'
const LANG = 'ru'
const CURRENT_WEATHER_REQUEST_TEMPLATE = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&lang=${LANG}&`
const FORECAST_WEATHER_REQUEST_TEMPLATE = `http://api.weatherapi.com/v1//forecast.json?key=${API_KEY}&days=7&lang=${LANG}&`

navigator.geolocation.getCurrentPosition(location => {
	const coords = `${location.coords.latitude},${location.coords.longitude}`
	getWeatherInfo(coords, true)
})

const searchForm = document.forms['search-form']

const forecastWeather = document.querySelector('.weather-forecast')
const forecastSlider = document.getElementById('forecast-slider')
const openForecastButton = document.getElementById('open-forecast-button')
const openForecastButtonWrapper = openForecastButton.parentElement

const currentWeather = document.querySelector('.weather-current')
const currentWeatherUpdateButton = document.getElementById('current-weather-update-button')

const cityName = document.getElementById('current-weather-city')
const conditionIcon = document.getElementById('current-weather-condition-icon')
const conditionText = document.getElementById('current-weather-condition-text')
const tempratureValue = document.getElementById('current-weather-temprature-value')

searchForm.addEventListener('submit', (e) => {
	e.preventDefault()
	getWeatherInfo(searchForm.elements['search-input'].value, true)
	searchForm.reset()
})

openForecastButton.addEventListener('click', (e) => {
	forecastWeather.classList.toggle('--visible')
	openForecastButton.innerText = openForecastButton.innerText === 'Показать прогноз на неделю'
		? openForecastButton.innerText = 'Скрыть прогноз на неделю'
		: openForecastButton.innerText = 'Показать прогноз на неделю'
})

currentWeatherUpdateButton.addEventListener('click', (e) => {
	currentWeatherUpdateButton.classList.add('--active')
	getWeatherInfo(cityName.innerText, false)
})

currentWeatherUpdateButton.addEventListener('animationend', (e) => {
	currentWeatherUpdateButton.classList.remove('--active')
})

async function getWeatherInfo(location, forecastRequest) {
	const currentWeatherQuery = await fetch(`${CURRENT_WEATHER_REQUEST_TEMPLATE}&q=${location}`)

	if (currentWeatherQuery.ok) {
		const currentWeatherInfo = await currentWeatherQuery.json()

		openForecastButtonWrapper.classList.add('--visible')
		currentWeather.classList.add('--visible')

		cityName.innerText = currentWeatherInfo.location.name
		conditionIcon.src = currentWeatherInfo.current.condition.icon
		conditionText.innerText = currentWeatherInfo.current.condition.text
		tempratureValue.innerText = Math.round(currentWeatherInfo.current.temp_c)
	}

	if (forecastRequest) {
		const forecastWeatherQuery = await fetch(`${FORECAST_WEATHER_REQUEST_TEMPLATE}&q=${location}`)

		if (forecastWeatherQuery.ok) {
			const forecastWeatherInfo = await forecastWeatherQuery.json()
			const dateIntl = Intl.DateTimeFormat('ru-RU', {
				weekday: 'long',
			})

			forecastSlider.scrollTo({
				left: 0,
				behavior: "smooth",
			})
			forecastSlider.innerHTML = ''

			forecastWeatherInfo.forecast.forecastday.forEach(forecastday => {
				const currentDate = new Date(forecastday.date)
				let weekday = dateIntl.format(currentDate)
				weekday = weekday[0].toUpperCase() + weekday.slice(1)

				forecastSlider.insertAdjacentHTML(
					'beforeend',
					`
					<div class="weather-forecast__day-info forecast-day-info">
						<p class="forecast-day-info__weekday">${weekday}</p>
						<img src="${forecastday.day.condition.icon}" alt="Состояние" class="forecast-day-info__condition-icon condition-icon">
						<p class="forecast-day-info__temprature temprature">
							<span class="forecast-day-info__temprature-value">${Math.round(forecastday.day.avgtemp_c)}</span>
							<span class="forecast-day-info__temprature-symbol">°C</span>
						</p>
						<p class="forecast-day-info__condition-text condition-text">${forecastday.day.condition.text}</p>
					</div>
					`
				)
			})
		}
	}
}