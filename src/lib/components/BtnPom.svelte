<script>
  let {iconSrc, ariaLabel, extraClasses} = $props();
</script>

<button
  type="button"
  class="btn rounded-circle {extraClasses}"
  aria-label={ariaLabel}
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