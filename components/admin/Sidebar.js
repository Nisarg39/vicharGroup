"use client"

export default function Sidebar(props) {
	const handleLogout = () => {
	    localStorage.removeItem('isAdmin');
        window.location.reload();
	};

	return (
		<div className="bg-gray-100">
			<div className="flex-col flex">
				<div className="w-full border-b-2 border-gray-200"></div>
				<div className="flex bg-gray-100 overflow-x-hidden mt-16">
					<div className="mt-8 bg-gray-50 lg:flex md:w-64 md:flex-col hidden fixed h-screen border-r-2 border-gray-200">
						<div className="flex-col pt-5 flex overflow-y-auto">
							<div className="h-full flex-col justify-between px-4 flex">
								<div className="space-y-4">
									<div className="bg-top bg-cover space-y-1">
										<a
											onClick={() => props.setDashBoardName("dashboard")}
											className="font-medium text-sm items-center rounded-lg text-gray-900 px-4 py-2.5 flex transition-all duration-200 hover:bg-gray-200 group cursor-pointer"
										>
											<span className="justify-center items-center flex">
												<svg
													className="flex-shrink-0 w-5 h-5 mr-4"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewbox="0 0 24 24"
													stroke="currentColor"
													stroke-width="2"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
													/>
												</svg>
											</span>
											<span>Admin Dashboard</span>
										</a>
										<a
											onClick={() => props.setDashBoardName("statistics")}
											className="font-medium text-sm items-center rounded-lg text-gray-900 px-4 py-2.5 flex
                    transition-all duration-200 hover:bg-gray-200 group cursor-pointer"
										>
											<span className="justify-center items-center flex">
												<svg
													className="flex-shrink-0 w-5 h-5 mr-4"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewbox="0 0 24 24"
													stroke="currentColor"
													stroke-width="2"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
													/>
												</svg>
											</span>
											<span>Statistics</span>
										</a>
										<a
											onClick={() => props.setDashBoardName("settings")}
											className="font-medium text-sm items-center rounded-lg text-gray-900 px-4 py-2.5 flex
                    transition-all duration-200 hover:bg-gray-200 group cursor-pointer"
										>
											<span className="justify-center items-center flex">
												<svg
													className="flex-shrink-0 w-5 h-5 mr-4"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewbox="0 0 24 24"
													stroke="currentColor"
													stroke-width="2"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
													/>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
													/>
												</svg>
											</span>
											<span>Settings</span>
										</a>
										<a
											onClick={handleLogout}
											className="font-medium text-sm items-center rounded-lg text-gray-900 px-4 py-2.5 flex
                    transition-all duration-200 hover:bg-gray-200 group cursor-pointer"
										>
											<span className="justify-center items-center flex">
												<svg
													className="flex-shrink-0 w-5 h-5 mr-4"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewbox="0 0 24 24"
													stroke="currentColor"
													stroke-width="2"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
													/>
												</svg>
											</span>
											<span>Logout</span>
										</a>
									</div>
								</div>
								<div className="mt-12 pb-4"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}