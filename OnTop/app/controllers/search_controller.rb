class SearchController < ApplicationController
  def index
  	@greetings = "Welcome to OnTop search engine"
  end

  def show
  	@key_word = params[:keyword]
  end
end
