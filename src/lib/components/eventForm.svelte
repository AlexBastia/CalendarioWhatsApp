<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { timingStore } from '$lib/stores/timing';
	import { format } from 'date-fns';

	let {
		formAction,
		pomodoroPresets = [],
		deleteAction,
		options,
		event = {
			_id: null,
			title: '',
			note: '',
			allDay: false,
			eventType: 'STANDARD',
			place: '',
			dateStart: format(new Date(), 'yyyy-MM-dd'),
			timeStart: '09:00',
			timeEnd: '10:00',
			pomodoroPreset: null,
			// Le notificationSettings non sono qui di default
			ripetizione: {
				isRepeatable: false,
				frequenza: '',
				giorniSettimana: [],
				monthlyMode: 'dayOfMonth',
				nthWeekday: { week: null, weekday: null },
				endCondition: { type: 'MAI', nVolte: null, endDate: '' },
				lastDate: null
			}
		}
	} = $props();

  console.log(options)

	if (options?.date) event.dateStart = options.date;
	if (options?.startTime) event.timeStart = options.startTime;
	if (options?.endTime) event.timeEnd = options.endTime;

	// Variabile locale reattiva su cui bindare
	let e = $state({ ...event });

	if (!e.notificationSettings) {
		e.notificationSettings = {
			enabled: false,
			advanceValue: 15,
			advanceUnit: 'minutes',
			repeat: 'none',
			repeat_number: 0
		};
	}
	$effect(() => {
		if (e.ripetizione.frequenza === 'MENSILE') {
			const d = new Date(e.dateStart);
			const week = Math.ceil(d.getDate() / 7);
			const weekday = d.getDay();
			e.ripetizione.nthWeekday = { week, weekday };
		}
	});
	function handleCancel() {
		history.back();
	}
</script>

<div class="card shadow-sm">
	<div class="card-header bg-light">
		<h4 class="my-1">
			{#if e._id}Modifica Evento{:else}Crea Nuovo Evento{/if}
		</h4>
	</div>

	<div class="card-body">
		<!-- MAIN FORM: bind sui campi locali 'e' -->
		<form method="POST" action={formAction} class="needs-validation" novalidate>
			{#if e._id}
				<input name="id" type="hidden" value={e._id} />
			{/if}

			<div class="row g-3">
				<div class="col-12">
					<div class="form-floating">
						<input
							type="text"
							class="form-control"
							id="title"
							name="title"
							placeholder="Titolo"
							bind:value={e.title}
							required
						/>
						<label for="title">Titolo</label>
					</div>
				</div>

				<div class="col-12">
					<div class="form-floating">
						<input
							type="text"
							class="form-control"
							id="note"
							name="note"
							placeholder="Descrizione"
							bind:value={e.note}
						/>
						<label for="note">Descrizione (opzionale)</label>
					</div>
				</div>

				<hr class="my-3" />

				<div class="col-md-6">
					<div class="form-floating">
						<!-- bind su e.eventType (variabile locale) -->
						<select class="form-select" id="eventType" name="eventType" bind:value={e.eventType}>
							<option value="STANDARD">📅 Evento Standard</option>
							<option value="POMODORO">🍅 Sessione Pomodoro</option>
						</select>
						<label for="eventType">Tipo di Evento</label>
					</div>
				</div>

				{#if e.eventType === 'POMODORO'}
					<div class="col-md-6">
						<div class="form-floating">
							<select
								class="form-select"
								id="pomodoroPreset"
								name="pomodoroPreset"
								bind:value={e.pomodoroPreset}
								required
							>
								<option value="" disabled selected>Scegli un preset...</option>
								{#each pomodoroPresets as preset}
									<option value={preset._id}>{preset.title}</option>
								{/each}
							</select>
							<label for="pomodoroPreset">Preset Pomodoro</label>
						</div>
					</div>
				{/if}

				<div class="col-12">
					<div class="form-floating">
						<input
							type="text"
							class="form-control"
							id="location"
							name="location"
							placeholder="Luogo"
							bind:value={e.place}
							required
						/>
						<label for="location">Luogo</label>
					</div>
				</div>

				<hr class="my-3" />

				<div class="col-12">
					<div class="form-check form-switch mb-3">
						<input
							class="form-check-input"
							type="checkbox"
							id="allDay"
							name="allDay"
							bind:checked={e.allDay}
						/>
						<label class="form-check-label" for="allDay">Tutto il giorno</label>
					</div>
				</div>

				<div class="col-md-5">
					<label for="dateStart" class="form-label">Data</label>
					<input
						type="date"
						id="dateStart"
						name="dateStart"
						class="form-control form-control-lg"
						bind:value={e.dateStart}
						required
					/>
				</div>

				<div class="col-md-3">
					<label for="timeStart" class="form-label">Inizio</label>
					<input
						type="time"
						id="timeStart"
						name="timeStart"
						class="form-control form-control-lg"
						bind:value={e.timeStart}
						disabled={e.allDay}
					/>
				</div>

				<div class="col-md-3">
					<label for="timeEnd" class="form-label">Fine</label>
					<input
						type="time"
						id="timeEnd"
						name="timeEnd"
						class="form-control form-control-lg"
						bind:value={e.timeEnd}
						disabled={e.allDay}
					/>
				</div>
				<div class="col-12 mt-3">
					<div class="form-check form-switch mb-3">
						<input
							class="form-check-input"
							type="checkbox"
							id="isRepeatable"
							name="isRepeatable"
							checked={e.ripetizione.isRepeatable}
							onchange={(ev) => (e.ripetizione.isRepeatable = ev.target.checked)}
							value="true"
						/>

						<label class="form-check-label" for="isRepeatable"> Evento ricorrente </label>
					</div>
				</div>

				{#if e.ripetizione.isRepeatable}
					<div class="col-md-6">
						<div class="form-floating">
							<select
								class="form-select"
								id="frequency"
								name="frequenza"
								bind:value={e.ripetizione.frequenza}
								required
							>
								<option value="" disabled>Scegli la frequenza...</option>
								<option value="GIORNALIERO">Ogni giorno</option>
								<option value="SETTIMANALE">Ogni settimana</option>
								<option value="MENSILE">Ogni mese</option>
								<option value="ANNUALE">Ogni anno</option>
							</select>
							<label for="frequency">Frequenza</label>
						</div>
					</div>

					{#if e.ripetizione.frequenza === 'SETTIMANALE'}
						<fieldset class="col-12">
							<legend class="form-label">Giorni della settimana</legend>
							<div class="d-flex gap-2 flex-wrap">
								{#each ['D', 'L', 'M', 'M', 'G', 'V', 'S'] as day, i}
									<div class="form-check">
										<input
											type="checkbox"
											class="form-check-input"
											id={`day${i}`}
											name="giorniSettimana"
											value={i}
											onchange={(evt) => {
												if (evt.currentTarget.checked) {
													e.ripetizione.giorniSettimana = [
														...e.ripetizione.giorniSettimana,
														i
													].sort((a, b) => a - b);
												} else {
													e.ripetizione.giorniSettimana = e.ripetizione.giorniSettimana
														.filter((d) => d !== i)
														.sort((a, b) => a - b);
												}
											}}
											checked={e.ripetizione.giorniSettimana.includes(i)}
										/>
										<label for={`day${i}`} class="form-check-label">{day}</label>
									</div>
								{/each}
							</div>
						</fieldset>
					{/if}

					{#if e.ripetizione.frequenza === 'MENSILE'}
						<fieldset class="col-12 mb-3">
							<legend class="form-label">Ripetizione mensile</legend>

							<div class="form-check">
								<input
									class="form-check-input"
									type="radio"
									id="monthlyDayOfMonth"
									name="monthlyMode"
									value="dayOfMonth"
									bind:group={e.ripetizione.monthlyMode}
								/>
								<label class="form-check-label" for="monthlyDayOfMonth">
									Ogni {new Date(e.dateStart).getDate()} del mese
								</label>
							</div>

							<div class="form-check">
								<input
									class="form-check-input"
									type="radio"
									id="monthlyNthWeekday"
									name="monthlyMode"
									value="nthWeekday"
									bind:group={e.ripetizione.monthlyMode}
								/>
								<label class="form-check-label" for="monthlyNthWeekday">
									Ogni {Number(e.ripetizione.nthWeekday.week)}°
									{['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'][
										Number(e.ripetizione.nthWeekday.weekday)
									]}
									del mese
								</label>
							</div>
						</fieldset>
						<input type="hidden" name="week" value={e.ripetizione.nthWeekday?.week || ''} />
						<input type="hidden" name="weekday" value={e.ripetizione.nthWeekday?.weekday || ''} />
					{/if}

					<div class="col-md-6">
						<div class="form-floating">
							<select
								class="form-select"
								id="endType"
								name="endType"
								bind:value={e.ripetizione.endCondition.type}
							>
								<option value="MAI">Mai</option>
								<option value="N_VOLTE">Dopo N occorrenze</option>
								<option value="FINO AL">Fino a data</option>
							</select>
							<label for="endType">Termina</label>
						</div>
					</div>

					{#if e.ripetizione.endCondition.type === 'N_VOLTE'}
						<div class="col-md-6">
							<div class="form-floating">
								<input
									type="number"
									min="1"
									class="form-control"
									id="count"
									name="endCount"
									bind:value={e.ripetizione.endCondition.nVolte}
								/>
								<label for="count">Numero di ripetizioni</label>
							</div>
						</div>
					{/if}

					{#if e.ripetizione.endCondition.type === 'FINO AL'}
						<div class="col-md-6">
							<div class="form-floating">
								<input
									type="date"
									class="form-control"
									id="endDate"
									name="endDate"
									bind:value={e.ripetizione.endCondition.endDate}
								/>
								<label for="endDate">Data fine</label>
							</div>
						</div>
					{/if}
				{/if}
			</div>

			<hr class="my-3" />

			<div class="col-12">
				<div class="form-check form-switch mb-2">
					<input
						class="form-check-input"
						type="checkbox"
						id="notificationEnabled"
						name="notificationEnabled"
						bind:checked={e.notificationSettings.enabled}
					/>
					<label class="form-check-label" for="notificationEnabled">🔔 Abilita Notifiche</label>
				</div>
			</div>

			{#if e.notificationSettings.enabled}
				<div class="col-12">
					<div class="row g-2 align-items-center">
						<div class="col-auto">
							<label for="notificationAdvanceValue" class="form-label mb-0">Notifica</label>
						</div>
						<div class="col-4 col-md-3">
							<input
								type="number"
								id="notificationAdvanceValue"
								name="notificationAdvanceValue"
								class="form-control"
								bind:value={e.notificationSettings.advanceValue}
								min="1"
							/>
						</div>
						<div class="col">
							<select
								class="form-select"
								name="notificationAdvanceUnit"
								bind:value={e.notificationSettings.advanceUnit}
							>
								<option value="minutes">minuti prima</option>
								<option value="hours">ore prima</option>
								<option value="days">giorni prima</option>
							</select>
						</div>
					</div>

					<div class="row g-2 align-items-center mt-2">
						<div class="col-auto">
							<label for="notificationRepeat" class="form-label mb-0">Ripeti ogni</label>
						</div>
						{#if e.notificationSettings.repeat !== 'none'}
							<div class="col-4 col-md-3">
								<input
									type="number"
									id="notificationRepeatNumber"
									name="notificationRepeatNumber"
									class="form-control"
									bind:value={e.notificationSettings.repeat_number}
									min="1"
								/>
							</div>
						{/if}
						<div class="col">
							<select
								class="form-select"
								id="notificationRepeat"
								name="notificationRepeat"
								bind:value={e.notificationSettings.repeat}
							>
								<option value="none">Mai (singola notifica)</option>
								<option value="minute">minuto/i</option>
								<option value="hour">ora/e</option>
								<option value="day">giorno/i</option>
							</select>
						</div>
					</div>
				</div>
			{/if}

			<hr class="my-3" />

			<div class="d-flex justify-content-end align-items-center gap-2">
				<button type="button" class="btn btn-secondary" onclick={handleCancel}>Annulla</button>

				{#if e.eventType === 'POMODORO' && e._id}
					<button
						type="button"
						class="btn btn-success"
						onclick={() => goto(`/pomodoro/${e.pomodoroPreset}?eventId=${e._id}`)}
					>
						<i class="bi bi-play-circle-fill me-2"></i>Avvia Sessione
					</button>
				{/if}

				<button class="btn btn-primary" type="submit">
					<i class="bi bi-check-lg me-2"></i>Salva Evento
				</button>
			</div>
		</form>

		{#if e._id}
			<div class="mt-3 d-flex justify-content-end">
				<!-- action deve essere passato come valore (senza virgolette) -->
				<form action={deleteAction} method="POST">
					<input type="hidden" name="id" value={e._id} />
					<button type="submit" class="btn btn-danger">
						<i class="bi bi-trash me-1"></i>Elimina
					</button>
				</form>
			</div>
		{/if}
	</div>
</div>
