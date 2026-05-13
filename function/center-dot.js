function createCenterDot() {
	const centerDot = document.createElement('div');
	centerDot.style.position = 'fixed';
	centerDot.style.left = '50%';
	centerDot.style.top = '50%';
	centerDot.style.width = '8px';
	centerDot.style.height = '8px';
	centerDot.style.borderRadius = '999px';
	centerDot.style.transform = 'translate(-50%, -50%)';
	centerDot.style.background = 'rgba(255, 255, 255, 0.95)';
	centerDot.style.border = '1px solid rgba(20, 20, 20, 0.8)';
	centerDot.style.pointerEvents = 'none';
	centerDot.style.zIndex = '20';
	document.body.appendChild(centerDot);
	return centerDot;
}