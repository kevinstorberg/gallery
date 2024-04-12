class CanvassesController < ApplicationController
  before_action :set_canvass,       only: [:show, :destroy, :contents, :clear]
  before_action :authorize_canvass, only: [:show, :destroy, :contents, :clear]

  def index
    @canvasses = current_user.canvasses
  end

  def show
  end

  def create
    @canvass = Canvass.create(user: current_user)

    redirect_to canvass_path(@canvass)
  end

  def destroy
    @canvass.destroy
    redirect_back fallback_location: canvasses_path
  end

  def contents
    @contents = @canvass.contents

    render json: { contents: @contents }, content_type: 'application/json', status: 200
  end

  def clear
    @canvass.contents.destroy_all

    redirect_back fallback_location: canvasses_path
  end

  private

  def set_canvass
    @canvass = Canvass.find(params[:id])
  end

  def authorize_canvass
    unless current_user.canvasses.where(id: @canvass.id).exists?
      return redirect_to canvasses_path
    end
  end
end