export function getMinutesUntilDeparture(time: string) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const [h, m] = time.split(":").map(Number);
  const departureMinutes = h * 60 + m;

  return departureMinutes - nowMinutes;
}

export function getNextLabel(time: string) {
  const diff = getMinutesUntilDeparture(time);

  if (diff <= 0) return `<i class="fa-solid fa-hand"></i> Последниот автобус за денес тргна. Се гледаме утре!`;
  if (diff === 1) return `<i class="fa-solid fa-clock"></i> Автобусот тргнува за 1 мин.`;
  if (diff < 60) return `<i class="fa-solid fa-clock"></i> Автобусот тргнува за ${diff} мин.`;

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  if (hours > 0) {
    return mins > 0
      ? `<i class="fa-solid fa-clock"></i> Автобусот тргнува за ${hours}ч. и ${mins}мин.`
      : `<i class="fa-solid fa-clock"></i> Автобусот тргнува за ${hours}ч.`;
  }

  return `<i class="fa-solid fa-clock"></i> Автобусот тргнува наскоро`;
}
