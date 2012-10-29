class SearchController < ApplicationController
  def index
  	@greetings = "Welcome to OnTop search engine"
  end

  def show
  	@key_word = params[:keyword]
  end

  ############################################
  # The following will be functional actions #
  # and has no corresponding view component	 #
  ############################################

  def fetch_by_keyword
	# Fetch related keywords by the keyword

  	@keyword = params[:keyword]

	if @keyword==nil
		@result = Keyword.all
	else
		@result = Keyword.find_by_name(@keyword)
	end

	# Return in the format of JSON object
	respond_to do |format|
		format.json { render :json => @result }
	end

  end

  def fetch_by_keyword_pairs
  end

  def fetch_info_by_keyword
  end

end
