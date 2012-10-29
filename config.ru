# This file is used by Rack-based servers to start the application.
# It has to locate at the root directory of a git repo, hence moving
# this file to here and to route into the subdir

WEBSITE_SUBDIR = 'OnTop'

require ::File.expand_path("../#{WEBSITE_SUBDIR}/config/environment",  __FILE__)
run OnTop::Application
