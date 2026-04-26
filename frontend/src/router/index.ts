import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ResultsView from "../views/ResultsView.vue";
import BusSearchView from "../views/BusSearchView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/results", component: ResultsView },
  { path: "/search", component: BusSearchView }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
