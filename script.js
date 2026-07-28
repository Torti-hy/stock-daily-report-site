'use strict';

const DATA_URL = 'data/reports.json';
const STOCK_NAME = '可乐丽（3405.T）';

const elements = {
  latestStatus: document.querySelector('#latest-status'),
  latestDate: document.querySelector('#latest-date'),
  latestUpdated: document.querySelector('#latest-updated'),
  latestContent: document.querySelector('#latest-content'),
  historyList: document.querySelector('#history-list'),
  modal: document.querySelector('#image-modal'),
  modalTitle: document.querySelector('#modal-title'),
  modalImage: document.querySelector('#modal-image'),
  modalError: document.querySelector('#modal-error'),
  modalClose: document.querySelector('#modal-close')
};

let lastFocusedElement = null;

function safeImagePath(value) {
  if (typeof value !== 'string' || !value.trim() || value.startsWith('/')) return null;
  try {
    const resolved = new URL(value, window.location.href);
    return resolved.origin === window.location.origin && resolved.protocol !== 'file:' ? value : null;
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '日期未提供';
  const [year, month, day] = value.split('-');
  return `${year}年${month}月${day}日`;
}

function formatUpdatedAt(value) {
  if (typeof value !== 'string') return '更新时间未提供';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '更新时间未提供';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
  }).format(date);
}

function statusText(status) {
  if (status === 'published') return '已发布';
  if (status === 'market_closed') return '休市';
  return '状态未提供';
}

function setLatestStatus(text, className = '') {
  elements.latestStatus.textContent = text;
  elements.latestStatus.className = `status-badge ${className}`.trim();
}

function buildEmptyState(message) {
  const wrapper = document.createElement('div');
  wrapper.className = 'empty-state';
  const illustration = document.createElement('img');
  illustration.src = 'assets/empty-report.svg';
  illustration.alt = '暂无日报的空状态插图';
  illustration.width = 320;
  illustration.height = 180;
  const text = document.createElement('p');
  text.textContent = message;
  wrapper.append(illustration, text);
  return wrapper;
}

function showLatestEmpty(message, status = '暂无日报', statusClass = '') {
  elements.latestContent.replaceChildren(buildEmptyState(message));
  setLatestStatus(status, statusClass);
}

function showMarketClosed(report) {
  const notice = document.createElement('div');
  notice.className = 'notice-state';
  const heading = document.createElement('strong');
  heading.textContent = '今日休市';
  const message = document.createElement('p');
  message.textContent = typeof report.message === 'string' && report.message.trim()
    ? report.message
    : '今日日本股市休市，暂无可乐丽常规收盘行情更新。';
  notice.append(heading, message);
  elements.latestContent.replaceChildren(notice);
  setLatestStatus('休市', 'market-closed');
}

function createImageButton(report, isLatest = false) {
  const path = safeImagePath(report.image);
  if (!path) return null;

  const container = document.createElement('div');
  const loading = document.createElement('p');
  loading.className = 'image-loading';
  loading.textContent = '图片正在加载…';
  loading.setAttribute('role', 'status');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'report-image-button';
  button.setAttribute('aria-label', `放大查看${formatDate(report.date)}日报截图`);
  button.hidden = true;

  const image = document.createElement('img');
  image.className = 'report-image';
  image.alt = `${STOCK_NAME}${formatDate(report.date)}每日股票行情截图`;
  image.decoding = 'async';
  image.src = path;
  image.addEventListener('load', () => {
    loading.remove();
    button.hidden = false;
    if (isLatest) setLatestStatus('已发布', 'published');
  });
  image.addEventListener('error', () => {
    button.remove();
    loading.textContent = '日报图片暂时无法加载，请稍后再试。';
    loading.className = 'modal-error';
    if (isLatest) setLatestStatus('图片不可用', 'error');
  });
  button.addEventListener('click', () => openModal(report));
  button.append(image);
  container.append(loading, button);
  return container;
}

function renderLatest(report) {
  if (!report || typeof report !== 'object') {
    elements.latestDate.textContent = '—';
    elements.latestUpdated.textContent = '—';
    showLatestEmpty('暂无已发布的日报截图');
    return;
  }

  elements.latestDate.textContent = formatDate(report.date);
  elements.latestUpdated.textContent = formatUpdatedAt(report.updatedAt);

  if (report.status === 'market_closed') {
    showMarketClosed(report);
    return;
  }

  const imageContent = report.status === 'published' ? createImageButton(report, true) : null;
  if (!imageContent) {
    showLatestEmpty('暂无已发布的日报截图');
    return;
  }
  elements.latestContent.replaceChildren(imageContent);
  setLatestStatus('图片加载中');
}

function renderHistory(reports) {
  elements.historyList.replaceChildren();
  if (!Array.isArray(reports) || reports.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'history-empty';
    empty.textContent = '暂无历史日报';
    elements.historyList.append(empty);
    return;
  }

  const sorted = reports.filter((item) => item && typeof item === 'object').sort((a, b) =>
    String(b.date || '').localeCompare(String(a.date || ''))
  );
  if (sorted.length === 0) return renderHistory([]);

  sorted.forEach((report) => {
    const item = document.createElement('article');
    item.className = 'history-item';
    const date = document.createElement('time');
    date.className = 'history-date';
    date.textContent = formatDate(report.date);
    if (typeof report.date === 'string') date.dateTime = report.date;
    const title = document.createElement('span');
    title.className = 'history-title';
    title.textContent = STOCK_NAME;
    const status = document.createElement('span');
    status.className = 'history-status';
    status.textContent = `状态：${statusText(report.status)}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'view-button';
    const canView = report.status === 'published' && Boolean(safeImagePath(report.image));
    button.textContent = canView ? '查看日报' : report.status === 'market_closed' ? '当日休市' : '暂无图片';
    button.disabled = !canView;
    if (canView) button.addEventListener('click', () => openModal(report));
    item.append(date, title, status, button);
    elements.historyList.append(item);
  });
}

function openModal(report) {
  const path = safeImagePath(report.image);
  if (!path) return;
  lastFocusedElement = document.activeElement;
  elements.modalTitle.textContent = typeof report.title === 'string' && report.title.trim()
    ? report.title : `${formatDate(report.date)}日报大图`;
  elements.modalError.hidden = true;
  elements.modalImage.hidden = true;
  elements.modalImage.alt = `${STOCK_NAME}${formatDate(report.date)}每日股票行情大图`;
  elements.modalImage.onload = () => { elements.modalImage.hidden = false; };
  elements.modalImage.onerror = () => {
    elements.modalImage.hidden = true;
    elements.modalError.hidden = false;
  };
  elements.modalImage.src = path;
  elements.modal.hidden = false;
  document.body.classList.add('modal-open');
  elements.modalClose.focus();
}

function closeModal() {
  if (elements.modal.hidden) return;
  elements.modal.hidden = true;
  document.body.classList.remove('modal-open');
  elements.modalImage.removeAttribute('src');
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

async function loadReports() {
  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error('Report index request failed');
    const data = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid report index');
    renderLatest(data.latest);
    renderHistory(data.reports);
  } catch {
    elements.latestDate.textContent = '—';
    elements.latestUpdated.textContent = '—';
    showLatestEmpty('日报信息暂时无法读取，请稍后再试。', '加载失败', 'error');
    elements.historyList.replaceChildren(buildEmptyState('历史日报暂时无法读取，请稍后再试。'));
  }
}

elements.modalClose.addEventListener('click', closeModal);
elements.modal.querySelector('[data-close-modal]').addEventListener('click', closeModal);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !elements.modal.hidden) closeModal();
  if (event.key === 'Tab' && !elements.modal.hidden) {
    event.preventDefault();
    elements.modalClose.focus();
  }
});

loadReports();
