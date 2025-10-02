<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { timingStore } from '$lib/stores/timing';
	import { format } from 'date-fns';
	import Title from '$lib/components/Title.svelte'

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
			dateEnd: format(new Date(), 'yyyy-MM-dd'),
			timeStart: '09:00',
			timeEnd: '10:00',
			pomodoroPreset: null,
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

	if (options?.date) {
		event.dateStart = options.date;
		event.dateEnd = options.date;
	}
	if (options?.startTime) event.timeStart = options.startTime;
	if (options?.endTime) event.timeEnd = options.endTime;

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

	// Computed per validazione
	let isFormValid = $derived(
		e.title.trim().length > 0 && 
		e.dateStart && 
		e.dateStart.trim().length > 0 &&
		e.dateEnd &&
		e.dateEnd.trim().length > 0 &&
		new Date(e.dateEnd) >= new Date(e.dateStart) &&
		(e.eventType !== 'POMODORO' || e.pomodoroPreset)
	);

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

<div class="page-container">
	<Title title={e._id ? 'Modifica Evento' : 'Crea Evento'} />
	
	<div class="form-wrapper">
		<div class="main-card">
			<div class="card-header">
				<h4 class="header-title">
						<i class="bi bi-plus-circle me-2"></i>
						Compila il form
					
				</h4>
			</div>

			<div class="card-body">
				<form method="POST" action={formAction} class="needs-validation" novalidate>
					{#if e._id}
						<input name="id" type="hidden" value={e._id} />
					{/if}

					<!-- Sezione Informazioni Base -->
					<section class="form-section">
						<h5 class="section-title">
							<i class="bi bi-info-circle me-2"></i>
							Informazioni Base
						</h5>
						
						<div class="row g-3">
							<div class="col-12">
								<div class="form-floating">
									<input
										type="text"
										class="form-control form-control-lg"
										id="title"
										name="title"
										placeholder="Titolo"
										bind:value={e.title}
										required
									/>
									<label for="title"><i class="bi bi-text-left me-2"></i>Titolo *</label>
								</div>
							</div>

							<div class="col-12">
								<div class="form-floating">
									<textarea
										class="form-control"
										id="note"
										name="note"
										placeholder="Descrizione"
										bind:value={e.note}
										style="height: 100px"
									></textarea>
									<label for="note"><i class="bi bi-card-text me-2"></i>Descrizione</label>
								</div>
							</div>

							<div class="col-12">
								<div class="form-floating">
									<input
										type="text"
										class="form-control"
										id="location"
										name="location"
										placeholder="Luogo"
										bind:value={e.place}
									/>
									<label for="location"><i class="bi bi-geo-alt me-2"></i>Luogo</label>
								</div>
							</div>
						</div>
					</section>

					<!-- Sezione Tipo Evento -->
					<section class="form-section">
						<h5 class="section-title">
							<i class="bi bi-calendar-event me-2"></i>
							Tipo di Evento
						</h5>
						
						<div class="row g-3">
							<div class="col-md-6">
								<div class="form-floating">
									<select class="form-select form-select-lg" id="eventType" name="eventType" bind:value={e.eventType}>
										<option value="STANDARD">📅 Evento Standard</option>
										<option value="POMODORO">🍅 Sessione Pomodoro</option>
									</select>
									<label for="eventType">Tipo</label>
								</div>
							</div>

							{#if e.eventType === 'POMODORO'}
								<div class="col-md-6">
									<div class="form-floating">
										<select
											class="form-select form-select-lg"
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
										<label for="pomodoroPreset">Preset Pomodoro *</label>
									</div>
								</div>
							{/if}
						</div>
					</section>

					<!-- Sezione Data e Ora -->
					<section class="form-section">
						<h5 class="section-title">
							<i class="bi bi-clock me-2"></i>
							Data e Ora
						</h5>
						
						<div class="row g-3">
							<div class="col-12">
								<div class="form-switch-wrapper">
									<input
										class="form-check-input"
										type="checkbox"
										id="allDay"
										name="allDay"
										bind:checked={e.allDay}
										style="font-size: 1.2em;"
									/>
									<label class="form-check-label fw-semibold ms-2" for="allDay">
										<i class="bi bi-sun me-2"></i>Tutto il giorno
									</label>
								</div>
							</div>

							<div class="col-md-5">
								<label for="dateStart" class="form-label fw-semibold">
									<i class="bi bi-calendar3 me-2"></i>Data Inizio *
								</label>
								<input
									type="date"
									id="dateStart"
									name="dateStart"
									class="form-control form-control-lg"
									bind:value={e.dateStart}
									required
								/>
							</div>

							<div class="col-md-5">
								<label for="dateEnd" class="form-label fw-semibold">
									<i class="bi bi-calendar-check me-2"></i>Data Fine *
								</label>
								<input
									type="date"
									id="dateEnd"
									name="dateEnd"
									class="form-control form-control-lg"
									bind:value={e.dateEnd}
									required
									min={e.dateStart}
								/>
							</div>

							<div class="col-md-3">
								<label for="timeStart" class="form-label fw-semibold">
									<i class="bi bi-clock-history me-2"></i>Inizio
								</label>
								<input
									type="time"
									id="timeStart"
									name="timeStart"
									class="form-control form-control-lg"
									bind:value={e.timeStart}
									disabled={e.allDay}
								/>
							</div>

							<div class="col-md-4">
								<label for="timeEnd" class="form-label fw-semibold">
									<i class="bi bi-clock me-2"></i>Fine
								</label>
								<input
									type="time"
									id="timeEnd"
									name="timeEnd"
									class="form-control form-control-lg"
									bind:value={e.timeEnd}
									disabled={e.allDay}
								/>
							</div>
						</div>
					</section>

					<!-- Sezione Ricorrenza -->
					<section class="form-section">
						<h5 class="section-title">
							<i class="bi bi-arrow-repeat me-2"></i>
							Ricorrenza
						</h5>
						
						<div class="row g-3">
							<div class="col-12">
								<div class="form-switch-wrapper">
									<input
										class="form-check-input"
										type="checkbox"
										id="isRepeatable"
										name="isRepeatable"
										checked={e.ripetizione.isRepeatable}
										onchange={(ev) => (e.ripetizione.isRepeatable = ev.target.checked)}
										value="true"
										style="font-size: 1.2em;"
									/>
									<label class="form-check-label fw-semibold ms-2" for="isRepeatable">
										<i class="bi bi-repeat me-2"></i>Evento ricorrente
									</label>
								</div>
							</div>

							{#if e.ripetizione.isRepeatable}
								<div class="col-12">
									<div class="recurrence-card">
										<div class="card-body">
											<div class="row g-3">
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
															<option value="GIORNALIERO">🗓️ Ogni giorno</option>
															<option value="SETTIMANALE">📅 Ogni settimana</option>
															<option value="MENSILE">📆 Ogni mese</option>
															<option value="ANNUALE">🎂 Ogni anno</option>
														</select>
														<label for="frequency">Frequenza</label>
													</div>
												</div>

                          {#if e.ripetizione.frequenza === 'SETTIMANALE'}
                            <fieldset class="col-12">
                              <legend class="form-label fw-semibold">Giorni della settimana</legend>
                              <div class="d-flex gap-2 flex-wrap days-grid">
                                {#each ['D', 'L', 'M', 'M', 'G', 'V', 'S'] as day, i}
                                  <div class="form-check">
                                    <input
                                      type="checkbox"
                                      class="btn-check"
                                      id={`day${i}`}
									  name = 'giorniSettimana${i}'
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
                                    <label for={`day${i}`} class="btn btn-outline-primary day-btn">{day}</label>
                                  </div>
                                {/each}
                              </div>
                            </fieldset>
                          {/if}

                          {#if e.ripetizione.frequenza === 'MENSILE'}
                            <fieldset class="col-12">
                              <legend class="form-label fw-semibold">Ripetizione mensile</legend>
                              <div class="monthly-options">
                                <div class="form-check mb-2">
                                  <input
                                    class="form-check-input"
                                    type="radio"
                                    id="monthlyDayOfMonth"
                                    name="monthlyMode"
                                    value="dayOfMonth"
                                    bind:group={e.ripetizione.monthlyMode}
                                  />
                                  <label class="form-check-label" for="monthlyDayOfMonth">
                                    Ogni <strong>{new Date(e.dateStart).getDate()}</strong> del mese
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
                                    Ogni <strong>{Number(e.ripetizione.nthWeekday.week)}°</strong>
                                    <strong>{['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'][
                                      Number(e.ripetizione.nthWeekday.weekday)
                                    ]}</strong>
                                    del mese
                                  </label>
                                </div>
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
															<option value="MAI">♾️ Mai</option>
															<option value="N_VOLTE">🔢 Dopo N occorrenze</option>
															<option value="FINO AL">📅 Fino a data</option>
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
											</div>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</section>

					<!-- Sezione Notifiche -->
					<section class="form-section">
						<h5 class="section-title">
							<i class="bi bi-bell me-2"></i>
							Notifiche
						</h5>
						
						<div class="row g-3">
							<div class="col-12">
								<div class="form-switch-wrapper">
									<input
										class="form-check-input"
										type="checkbox"
										id="notificationEnabled"
										name="notificationEnabled"
										bind:checked={e.notificationSettings.enabled}
										style="font-size: 1.2em;"
									/>
									<label class="form-check-label fw-semibold ms-2" for="notificationEnabled">
										<i class="bi bi-bell-fill me-2"></i>Abilita Notifiche
									</label>
								</div>
							</div>

							{#if e.notificationSettings.enabled}
								<div class="col-12">
									<div class="notification-card">
										<div class="card-body">
											<div class="row g-3">
												<div class="col-12">
													<label class="form-label fw-semibold">
														<i class="bi bi-alarm me-2"></i>Anticipo notifica
													</label>
													<div class="row g-2">
														<div class="col-5 col-md-3">
															<input
																type="number"
																id="notificationAdvanceValue"
																name="notificationAdvanceValue"
																class="form-control form-control-lg"
																bind:value={e.notificationSettings.advanceValue}
																min="1"
															/>
														</div>
														<div class="col-7 col-md-9">
															<select
																class="form-select form-select-lg"
																name="notificationAdvanceUnit"
																bind:value={e.notificationSettings.advanceUnit}
															>
																<option value="minutes">minuti prima</option>
																<option value="hours">ore prima</option>
																<option value="days">giorni prima</option>
															</select>
														</div>
													</div>
												</div>

												<div class="col-12">
													<label class="form-label fw-semibold">
														<i class="bi bi-arrow-repeat me-2"></i>Ripeti notifica
													</label>
													<div class="row g-2">
														{#if e.notificationSettings.repeat !== 'none'}
															<div class="col-5 col-md-3">
																<input
																	type="number"
																	id="notificationRepeatNumber"
																	name="notificationRepeatNumber"
																	class="form-control form-control-lg"
																	bind:value={e.notificationSettings.repeat_number}
																	min="1"
																/>
															</div>
														{/if}
														<div class="col">
															<select
																class="form-select form-select-lg"
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
											</div>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</section>

					<!-- Bottoni Azione -->
					<div class="action-buttons">
						<button type="button" class="btn btn-outline-secondary btn-lg" onclick={handleCancel}>
							<i class="bi bi-x-circle me-2"></i>Annulla
						</button>

						<div class="btn-group-right">
							{#if e.eventType === 'POMODORO' && e._id}
								<button
									type="button"
									class="btn btn-success btn-lg"
									onclick={() => goto(`/pomodoro/${e.pomodoroPreset}?eventId=${e._id}`)}
								>
									<i class="bi bi-play-circle-fill me-2"></i>Avvia Sessione
								</button>
							{/if}

							<button 
								class="btn btn-primary btn-lg px-4" 
								type="submit"
								disabled={!isFormValid}
							>
								<i class="bi bi-check-circle-fill me-2"></i>
								{e._id ? 'Aggiorna' : 'Salva'} Evento
							</button>
						</div>
					</div>
				</form>

				{#if e._id}
					<div class="delete-section">
						<form action={deleteAction} method="POST">
							<input type="hidden" name="id" value={e._id} />
							<button type="submit" class="btn btn-outline-danger btn-lg w-100">
								<i class="bi bi-trash3 me-2"></i>Elimina Evento
							</button>
						</form>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.page-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 20px;
		font-family: system-ui, -apple-system, sans-serif;
		min-height: 100vh;
		overflow-y: auto;
	}

	.form-wrapper {
		background: #ffffff;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.main-card {
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.main-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
	}

	.card-header {
		background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
		color: white;
		padding: 24px;
	}

	.header-title {
		margin: 0;
		font-size: 1.5em;
		font-weight: 600;
	}

	.card-body {
		padding: 32px;
		max-height: calc(100vh - 200px);
		overflow-y: auto;
	}

	.form-section {
		margin-bottom: 32px;
		padding: 20px;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		background-color: #fafafa;
		transition: box-shadow 0.2s;
	}

	.form-section:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.section-title {
		display: flex;
		align-items: center;
		margin: 0 0 20px 0;
		font-size: 1.3em;
		font-weight: 600;
		color: #333;
		border-bottom: 2px solid #f0f0f0;
		padding-bottom: 10px;
	}

	.form-switch-wrapper {
		display: flex;
		align-items: center;
		padding: 16px;
		background: #f8f9fa;
		border-radius: 8px;
		border: 1px solid #e9ecef;
		transition: background-color 0.2s;
	}

	.form-switch-wrapper:hover {
		background: #f0f4ff;
	}

	.recurrence-card,
	.notification-card {
		border: 1px solid #dee2e6;
		border-radius: 8px;
		background: #ffffff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.recurrence-card {
		border-left: 4px solid #0d6efd;
	}

	.notification-card {
		border-left: 4px solid #ffc107;
	}

	.card-body {
		padding: 20px;
	}

	.monthly-options {
		padding: 16px;
		background: #f8f9fa;
		border-radius: 6px;
	}

	.days-grid {
		gap: 8px;
	}

	.day-btn {
		padding: 8px 12px;
		border-radius: 20px;
		font-size: 0.9em;
		transition: all 0.2s;
		min-width: 40px;
		text-align: center;
	}

	.btn-check:checked + .day-btn {
		background-color: #0d6efd;
		border-color: #0d6efd;
		color: white;
		transform: scale(1.05);
	}

	.action-buttons {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
		margin-top: 24px;
		padding-top: 24px;
		border-top: 1px solid #e0e0e0;
	}

	.btn-group-right {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	.delete-section {
		margin-top: 24px;
		padding-top: 24px;
		border-top: 1px solid #e0e0e0;
	}

	.form-control:focus,
	.form-select:focus {
		border-color: #0d6efd;
		box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
	}

	.form-floating > label {
		color: #6c757d;
	}

	.form-floating > .form-control:focus ~ label,
	.form-floating > .form-control:not(:placeholder-shown) ~ label,
	.form-floating > .form-select ~ label {
		color: #0d6efd;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn {
		transition: all 0.2s ease;
		border-radius: 8px;
	}

	.btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	@media (max-width: 768px) {
		.page-container {
			padding: 16px;
		}

		.card-body {
			padding: 20px !important;
		}

		.form-section {
			padding: 16px;
		}

		.action-buttons {
			flex-direction: column-reverse;
			gap: 12px;
		}

		.btn-group-right {
			width: 100%;
			justify-content: center;
		}
	}
</style>