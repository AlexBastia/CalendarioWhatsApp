<script>
  export let iconSrc;
  export let ariaLabel;
  export let extraClasses = '';
</script>

<button
  type="button"
  class="btn p-5 m-2 rounded-circle {extraClasses}"
  aria-label={ariaLabel}
  on:click
>
  <img src={iconSrc} alt={ariaLabel} />
</button>

<style>
  
  .btn {
    transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
  }
  .btn:hover {
    background-color: #e9ecef; 
  }
  .btn:active {
    transform: scale(0.95); 
  }
</style>