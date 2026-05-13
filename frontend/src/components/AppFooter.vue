<template>
  <footer class="bg-blue-900 text-white py-4 px-6">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-8">

      <!-- Лого -->
      <div class="flex-shrink-0">
        <h2 class="text-base font-bold"><i class="fa-solid fa-bus-simple"></i> Busly</h2>
        <p class="text-blue-200 text-xs mt-1">Автобуски линии низ Македонија.</p>
      </div>

      <!-- Контакт во две колони -->
      <div class="flex gap-8 text-xs text-blue-200">
        <ul class="space-y-1">
          <li class="flex items-center gap-1.5">
            <span><i class="fa-solid fa-location-dot"></i></span>
            <span>Ул. Никола Кареев бр.20, Пош. фах: 356</span>
          </li>
          <li class="flex items-center gap-1.5">
            <span><i class="fa-solid fa-phone"></i></span>
            <span>+389 (0)2 2466 313</span>
          </li>
          <li class="flex items-center gap-1.5">
            <span><i class="fa-solid fa-phone"></i></span>
            <span>+389 (0)2 2466 011</span>
          </li>
        </ul>
        <ul class="space-y-1">
          <li class="flex items-center gap-1.5">
            <span><i class="fa-solid fa-fax"></i></span>
            <span>Факс: +389 (0)2 2402 385</span>
          </li>
          <li class="flex items-center gap-1.5">
            <span><i class="fa-solid fa-envelope"></i></span>
            <a href="mailto:info@busly.com.mk" class="hover:text-white transition">info@busly.com.mk</a>
          </li>
        </ul>
      </div>

      <!-- Copyright -->
      <div class="text-blue-300 text-xs flex-shrink-0">
        © {{ new Date().getFullYear() }} Busly
      </div>

    </div>
  </footer>
</template>